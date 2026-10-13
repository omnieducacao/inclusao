import { describe, it, expect } from "vitest";
import { FOLHA, layoutFolha, homografia, aplicar, lerFolha, type ImagemCinza, type Ponto } from "@/lib/prova-omr";
import type { ItemProva } from "@/lib/prova";

const alt = (n: number) => ["A", "B", "C", "D"].slice(0, n).map((l) => ({ letra: l as "A", texto: `opção ${l}` }));
const itens: ItemProva[] = [
  { id: "i1", codigo: "X", ordem: 1, tipo: "objetiva", enunciado: "1", alternativas: alt(3), gabarito: "B" },
  { id: "i2", codigo: "X", ordem: 2, tipo: "objetiva", enunciado: "2", alternativas: alt(4), gabarito: "D" },
  { id: "i3", codigo: "Y", ordem: 1, tipo: "aberta", enunciado: "3" },
  { id: "i4", codigo: "Y", ordem: 2, tipo: "objetiva", enunciado: "4", alternativas: alt(4), gabarito: "A" },
];

/** Desenha uma "foto" sintética da folha: perspectiva leve, papel com ruído, marcas pintadas. */
function fotografar(marcas: Record<string, string[]>, cantos: Ponto[]): ImagemCinza {
  const W = 900, H = 1280;
  const mmParaPx = homografia(FOLHA.centros, cantos)!;
  const pxParaMm = homografia(cantos, FOLHA.centros)!;
  void mmParaPx;
  const linhas = layoutFolha(itens);
  const pintadas: Array<{ x: number; y: number; r?: number }> = [];
  const contornos: Array<{ x: number; y: number }> = [];
  for (const l of linhas) {
    for (const b of [...l.opcoes, ...l.apoio]) {
      contornos.push(b);
      if ((marcas[l.itemId] || []).includes(b.valor)) pintadas.push(b);
      // "B." = só um pontinho no meio da bolinha
      if ((marcas[l.itemId] || []).includes(`${b.valor}.`)) pintadas.push({ ...b, r: 1.1 });
    }
  }
  const px = new Uint8Array(W * H);
  let semente = 7;
  const rnd = () => ((semente = (semente * 16807) % 2147483647) / 2147483647);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const [mx, my] = aplicar(pxParaMm, [x, y]);
      let v = 225 + Math.floor(rnd() * 25); // papel
      if (mx < 0 || mx > 210 || my < 0 || my > 297) v = 90 + Math.floor(rnd() * 30); // mesa
      for (const [cx, cy] of FOLHA.centros) if (Math.abs(mx - cx) <= 4 && Math.abs(my - cy) <= 4) v = 20;
      for (const b of contornos) {
        const d = Math.hypot(mx - b.x, my - b.y);
        if (d <= FOLHA.raio && d >= FOLHA.raio - 0.3) v = 70;
      }
      for (const b of pintadas) if (Math.hypot(mx - b.x, my - b.y) <= (b.r ?? FOLHA.raio - 0.4)) v = 40 + Math.floor(rnd() * 30);
      px[y * W + x] = v;
    }
  }
  return { largura: W, altura: H, px };
}

describe("folha de respostas lida por foto (OMR)", () => {
  const torta: Ponto[] = [[70, 60], [840, 85], [55, 1215], [860, 1190]];

  it("lê as letras, o nível da aberta e o apoio, mesmo com a foto torta", () => {
    const img = fotografar({ i1: ["B", "leve"], i2: ["C", "nenhum"], i3: ["3", "total"], i4: ["A"] }, torta);
    const r = lerFolha(img, itens);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.respostas.i1).toMatchObject({ marcada: "B", apoio: "leve", fonte: "foto" });
    expect(r.respostas.i2).toMatchObject({ marcada: "C", apoio: "nenhum" });
    expect(r.respostas.i3).toMatchObject({ nivel: 3, apoio: "total" });
    expect(r.respostas.i4).toMatchObject({ marcada: "A", apoio: "nenhum" });
    expect(r.conferir).toBe(0);
  });

  it("em branco fica null; duas marcas pedem conferência", () => {
    const img = fotografar({ i1: [], i2: ["A", "B"], i3: [], i4: ["D", "leve"] }, torta);
    const r = lerFolha(img, itens);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.respostas.i1.marcada).toBeNull();
    expect(r.respostas.i2.conferir).toBe(true);
    expect(r.respostas.i3.nivel).toBeUndefined();
    expect(r.respostas.i4).toMatchObject({ marcada: "D", apoio: "leve" });
    expect(r.conferir).toBe(1);
  });

  it("sem os quadrados dos cantos, explica como refazer a foto", () => {
    const W = 300, H = 420;
    const r = lerFolha({ largura: W, altura: H, px: new Uint8Array(W * H).fill(240) }, itens);
    expect(r.ok).toBe(false);
  });
});

describe("quadrados dos cantos fora do lugar", () => {
  it("descarta um quadrado de baixo que não fecha uma folha A4", async () => {
    const { descartarImplausiveis } = await import("@/lib/prova-omr");
    const p: Array<[number, number] | null> = [[100, 100], [1000, 100], [80, 700], null];
    descartarImplausiveis(p);
    expect(p[2]).toBeNull();
    const bom: Array<[number, number] | null> = [[100, 100], [1000, 100], [110, 1430], [990, 1420]];
    descartarImplausiveis(bom);
    expect(bom.every(Boolean)).toBe(true);
  });
});

describe("marca fraca", () => {
  it("um pontinho sugere a letra, mas pede para a professora conferir", () => {
    const img = fotografar({ i1: ["B."], i2: ["C"], i3: ["2"], i4: ["A"] }, [[70, 60], [840, 85], [55, 1215], [860, 1190]]);
    const r = lerFolha(img, itens);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.respostas.i1.marcada).toBe("B");
    expect(r.respostas.i1.conferir).toBe(true);
    expect(r.respostas.i2).toMatchObject({ marcada: "C" });
    expect(r.respostas.i2.conferir).toBeUndefined();
  });
});
