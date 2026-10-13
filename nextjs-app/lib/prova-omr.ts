/**
 * Onda 25 — folha de respostas lida por foto (OMR: leitura óptica de marcas), sem IA e sem custo.
 *
 * A folha (A4, medidas em mm) tem quatro quadrados pretos nos cantos. Na foto, o leitor acha
 * os quadrados, calcula a perspectiva (homografia) e mede quanto de cada bolinha está pintado.
 * Objetivas: bolinhas A–D. Abertas/observação: a professora pinta o nível da rubrica (0–4).
 * Em todas: a professora pinta o apoio que deu (nenhum, leve, total).
 *
 * O mesmo layout serve para desenhar o PDF (lib/prova-pdf.ts) e para ler a foto. Funções puras,
 * sem DOM: a tela passa os pixels de um canvas. Este arquivo vai para o navegador.
 */
import type { ApoioDado, ItemProva, Letra, RespostaItem } from "@/lib/prova";
import { LETRAS } from "@/lib/prova";

export const FOLHA = {
  largura: 210,
  altura: 297,
  marcador: 8, // lado do quadrado preto
  centros: [
    [14, 14], [196, 14], [14, 283], [196, 283],
  ] as Array<[number, number]>,
  topoItens: 62,
  alturaLinha: 9.5,
  raio: 3,
  xOpcoes: [44, 56, 68, 80, 92],
  xApoio: [128, 150, 172],
  maxItens: 21,
};

export const APOIOS: ApoioDado[] = ["nenhum", "leve", "total"];

export type Bolinha = { valor: string; x: number; y: number };
export type LinhaFolha = { itemId: string; numero: number; tipo: ItemProva["tipo"]; y: number; opcoes: Bolinha[]; apoio: Bolinha[] };

/** Onde fica cada bolinha de cada item na folha (mm). */
export function layoutFolha(itens: ItemProva[]): LinhaFolha[] {
  return itens.slice(0, FOLHA.maxItens).map((item, i) => {
    const y = FOLHA.topoItens + i * FOLHA.alturaLinha;
    const valores = item.tipo === "objetiva" ? (item.alternativas || []).map((a) => a.letra as string) : ["0", "1", "2", "3", "4"];
    return {
      itemId: item.id,
      numero: i + 1,
      tipo: item.tipo,
      y,
      opcoes: valores.map((v, k) => ({ valor: v, x: FOLHA.xOpcoes[k], y })),
      apoio: APOIOS.map((v, k) => ({ valor: v, x: FOLHA.xApoio[k], y })),
    };
  });
}

// ─── Álgebra: homografia por 4 pontos ──────────────────────────────────────

export type Ponto = [number, number];
export type Homografia = number[]; // 9 valores, h[8] = 1

function resolver(A: number[][], b: number[]): number[] | null {
  const n = b.length;
  const M = A.map((l, i) => [...l, b[i]]);
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    if (Math.abs(M[p][c]) < 1e-12) return null;
    [M[c], M[p]] = [M[p], M[c]];
    for (let r = 0; r < n; r++) {
      if (r === c) continue;
      const f = M[r][c] / M[c][c];
      for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k];
    }
  }
  return M.map((l, i) => l[n] / l[i]);
}

/** Homografia que leva os pontos `de` (mm na folha) para `para` (pixels na foto). */
export function homografia(de: Ponto[], para: Ponto[]): Homografia | null {
  const A: number[][] = [];
  const b: number[] = [];
  for (let i = 0; i < 4; i++) {
    const [x, y] = de[i];
    const [u, v] = para[i];
    A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]); b.push(u);
    A.push([0, 0, 0, x, y, 1, -v * x, -v * y]); b.push(v);
  }
  const h = resolver(A, b);
  return h ? [...h, 1] : null;
}

export function aplicar(h: Homografia, [x, y]: Ponto): Ponto {
  const w = h[6] * x + h[7] * y + h[8];
  return [(h[0] * x + h[1] * y + h[2]) / w, (h[3] * x + h[4] * y + h[5]) / w];
}

// ─── Imagem ────────────────────────────────────────────────────────────────

export type ImagemCinza = { largura: number; altura: number; px: Uint8Array };

/** RGBA (ImageData de um canvas) → tons de cinza. */
export function paraCinza(largura: number, altura: number, rgba: Uint8ClampedArray | Uint8Array): ImagemCinza {
  const px = new Uint8Array(largura * altura);
  for (let i = 0, j = 0; i < px.length; i++, j += 4) px[i] = (rgba[j] * 299 + rgba[j + 1] * 587 + rgba[j + 2] * 114) / 1000;
  return { largura, altura, px };
}

/** Limiar de Otsu: separa o escuro (tinta) do claro (papel). */
export function limiarOtsu(img: ImagemCinza): number {
  const hist = new Array(256).fill(0);
  for (const v of img.px) hist[v]++;
  const total = img.px.length;
  let soma = 0;
  for (let i = 0; i < 256; i++) soma += i * hist[i];
  let somaB = 0, wB = 0, melhor = 0, limiar = 128;
  for (let t = 0; t < 256; t++) {
    wB += hist[t];
    if (!wB) continue;
    const wF = total - wB;
    if (!wF) break;
    somaB += t * hist[t];
    const mB = somaB / wB, mF = (soma - somaB) / wF;
    const entre = wB * wF * (mB - mF) ** 2;
    if (entre > melhor) { melhor = entre; limiar = t; }
  }
  return limiar;
}

/** Acha o quadrado preto mais perto de um canto, dentro da região [x0,x1)×[y0,y1). */
function acharMarcador(img: ImagemCinza, limiar: number, x0: number, y0: number, x1: number, y1: number, canto: Ponto, ladoEsperado: number): Ponto | null {
  const { largura, px } = img;
  const visto = new Uint8Array((x1 - x0) * (y1 - y0));
  const w = x1 - x0;
  let melhor: { c: Ponto; d: number } | null = null;
  const fila: number[] = [];
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const li = (y - y0) * w + (x - x0);
      if (visto[li] || px[y * largura + x] > limiar) continue;
      // componente conectada (4 vizinhos)
      let n = 0, sx = 0, sy = 0, minX = x, maxX = x, minY = y, maxY = y;
      fila.length = 0; fila.push(x, y); visto[li] = 1;
      while (fila.length) {
        const cy = fila.pop()!, cx = fila.pop()!;
        n++; sx += cx; sy += cy;
        if (cx < minX) minX = cx; if (cx > maxX) maxX = cx; if (cy < minY) minY = cy; if (cy > maxY) maxY = cy;
        for (const [nx, ny] of [[cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]]) {
          if (nx < x0 || nx >= x1 || ny < y0 || ny >= y1) continue;
          const nli = (ny - y0) * w + (nx - x0);
          if (visto[nli] || px[ny * largura + nx] > limiar) continue;
          visto[nli] = 1; fila.push(nx, ny);
        }
      }
      const bw = maxX - minX + 1, bh = maxY - minY + 1;
      const proporcao = bw / bh;
      const cheio = n / (bw * bh);
      const tamanhoOk = bw > ladoEsperado * 0.5 && bw < ladoEsperado * 2.2 && bh > ladoEsperado * 0.5 && bh < ladoEsperado * 2.2;
      if (!tamanhoOk || proporcao < 0.6 || proporcao > 1.6 || cheio < 0.6) continue;
      const c: Ponto = [sx / n, sy / n];
      const d = Math.hypot(c[0] - canto[0], c[1] - canto[1]);
      if (!melhor || d < melhor.d) melhor = { c, d };
    }
  }
  return melhor?.c ?? null;
}

/** Fração de pixels escuros dentro de um círculo. */
function preenchimento(img: ImagemCinza, limiar: number, [cx, cy]: Ponto, r: number): number {
  let escuros = 0, total = 0;
  const r2 = r * r;
  for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++) {
    if (y < 0 || y >= img.altura) continue;
    for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
      if (x < 0 || x >= img.largura) continue;
      if ((x - cx) ** 2 + (y - cy) ** 2 > r2) continue;
      total++;
      if (img.px[y * img.largura + x] <= limiar) escuros++;
    }
  }
  return total ? escuros / total : 0;
}

/** Proporção altura/largura entre os centros dos quadrados (269 × 182 mm na folha). */
const PROPORCAO = (FOLHA.centros[2][1] - FOLHA.centros[0][1]) / (FOLHA.centros[1][0] - FOLHA.centros[0][0]);

/**
 * Um quadrado achado longe de onde a folha diz que ele deveria estar (outra coisa escura na foto:
 * borda de mesa, celular, teclado) é descartado. Mede cada lado contra o lado oposto já confirmado,
 * com folga para a perspectiva da foto.
 */
export function descartarImplausiveis(p: Array<Ponto | null>): void {
  const d = (a: Ponto, b: Ponto) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  const ok = (r: number) => r > PROPORCAO * 0.65 && r < PROPORCAO * 1.45;
  const [te, td, be, bd] = p;
  if (te && td) {
    const w = d(te, td);
    if (be && !ok(d(te, be) / w)) p[2] = null;
    if (bd && !ok(d(td, bd) / w)) p[3] = null;
  } else if (be && bd) {
    const w = d(be, bd);
    if (te && !ok(d(te, be) / w)) p[0] = null;
    if (td && !ok(d(td, bd) / w)) p[1] = null;
  }
}

export type LeituraFolha =
  | { ok: true; respostas: Record<string, RespostaItem>; conferir: number }
  | { ok: false; erro: string };

const MARCADA = 0.42;
const DUVIDA = 0.22;
/** Abaixo de DUVIDA, mas com tinta: um pontinho ou um risco. Não conta como resposta, mas a professora confere. */
const RISCO = 0.07;

function escolher(fills: Array<{ valor: string; f: number }>): { valor: string | null; conferir: boolean } {
  const ordenados = [...fills].sort((a, b) => b.f - a.f);
  const [p, s] = ordenados;
  if (!p || p.f < RISCO) return { valor: null, conferir: false };
  if (p.f < DUVIDA) return { valor: null, conferir: true };
  if (p.f >= MARCADA && (!s || s.f < MARCADA)) return { valor: p.valor, conferir: false };
  return { valor: p.valor, conferir: true };
}

/** Lê a folha de respostas de uma foto (pixels em cinza). */
export function lerFolha(img: ImagemCinza, itens: ItemProva[]): LeituraFolha {
  const limiar = Math.min(limiarOtsu(img), 150);
  const { largura: W, altura: H } = img;
  const pxPorMm = Math.min(W / FOLHA.largura, H / FOLHA.altura);
  const lado = FOLHA.marcador * pxPorMm;
  const fx = Math.round(W * 0.32), fy = Math.round(H * 0.25);
  const cantos: Array<[number, number, number, number, Ponto]> = [
    [0, 0, fx, fy, [0, 0]],
    [W - fx, 0, W, fy, [W, 0]],
    [0, H - fy, fx, H, [0, H]],
    [W - fx, H - fy, W, H, [W, H]],
  ];
  const achados = cantos.map(([x0, y0, x1, y1, c]) => acharMarcador(img, limiar, x0, y0, x1, y1, c, lado));
  descartarImplausiveis(achados);
  if (achados.every(Boolean)) {
    // os quatro precisam fechar um quadrilátero coerente: o 4º perto de onde os outros três o colocam
    const [te, td, be, bd] = achados as Ponto[];
    const esperado: Ponto = [td[0] + be[0] - te[0], td[1] + be[1] - te[1]];
    const w = Math.hypot(td[0] - te[0], td[1] - te[1]);
    if (Math.hypot(bd[0] - esperado[0], bd[1] - esperado[1]) > w * 0.35) {
      return { ok: false, erro: "Os quadrados dos cantos não formam a folha: pode haver outra coisa escura na foto. Fotografe só a folha, inteira, sobre uma mesa clara." };
    }
  }
  if (achados.some((p) => !p)) {
    const nomes = ["de cima à esquerda", "de cima à direita", "de baixo à esquerda", "de baixo à direita"];
    const faltam = nomes.filter((_, i) => !achados[i]);
    const dica = !achados[2] && !achados[3] && achados[0] && achados[1]
      ? " A parte de baixo da folha ficou fora da foto: afaste o celular até a folha inteira aparecer."
      : !achados[0] && !achados[1] && achados[2] && achados[3]
        ? " A parte de cima da folha ficou fora da foto: afaste o celular até a folha inteira aparecer."
        : " Fotografe a folha inteira, de cima, com boa luz e sem sombra.";
    return { ok: false, erro: `Achei ${4 - faltam.length} dos 4 quadrados pretos dos cantos (faltou ${faltam.join(", ")}).${dica}` };
  }
  const h = homografia(FOLHA.centros, achados as Ponto[]);
  if (!h) return { ok: false, erro: "A foto ficou torta demais. Tente de novo, com o celular paralelo à folha." };
  // raio da bolinha em pixels, medido no meio da folha
  const [ax, ay] = aplicar(h, [105, 150]);
  const [bx, by] = aplicar(h, [105 + FOLHA.raio, 150]);
  const r = Math.max(2, Math.hypot(bx - ax, by - ay) * 0.62);

  const respostas: Record<string, RespostaItem> = {};
  let conferir = 0;
  for (const linha of layoutFolha(itens)) {
    const fills = linha.opcoes.map((b) => ({ valor: b.valor, f: preenchimento(img, limiar, aplicar(h, [b.x, b.y]), r) }));
    const apoioFills = linha.apoio.map((b) => ({ valor: b.valor, f: preenchimento(img, limiar, aplicar(h, [b.x, b.y]), r) }));
    const resp = escolher(fills);
    const ap = escolher(apoioFills);
    const duvida = resp.conferir || ap.conferir;
    if (duvida) conferir++;
    const base: RespostaItem = { apoio: (ap.valor as ApoioDado) || "nenhum", fonte: "foto", ...(duvida ? { conferir: true } : {}) };
    respostas[linha.itemId] = linha.tipo === "objetiva"
      ? { ...base, marcada: (resp.valor as Letra | null) ?? null }
      : resp.valor === null ? { ...base } : { ...base, nivel: Number(resp.valor) };
  }
  return { ok: true, respostas, conferir };
}

export { LETRAS };
