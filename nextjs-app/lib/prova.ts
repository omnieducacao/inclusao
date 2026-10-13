/**
 * Onda 25 — prova em papel da avaliação diagnóstica e processual.
 *
 * Fluxo: a professora escolhe os descritores → a IA monta a prova (dois itens por descritor:
 * o 1º com apoio, o 2º sem apoio) → a professora revisa e imprime (caderno adaptado ao PEI,
 * folha de respostas e guia com gabarito) → corrige de um dos quatro jeitos (grade rápida,
 * foto da folha, rubrica nas abertas, IA lê a resposta escrita) → o sistema sugere o nível
 * 0–4 de cada descritor → a professora confirma e os níveis vão para a avaliação.
 *
 * A escala mede apoio, não nota. Por isso cada resposta guarda também o apoio que a
 * professora deu na hora (nenhum, leve, total). Este arquivo vai para o navegador: nada de fs.
 */

export type TipoItem = "objetiva" | "aberta" | "observacao";
export type ApoioDado = "nenhum" | "leve" | "total";
export const LETRAS = ["A", "B", "C", "D"] as const;
export type Letra = (typeof LETRAS)[number];

export type Alternativa = { letra: Letra; texto: string; /** O erro que essa alternativa revela (só no guia da professora). */ erro?: string };
export type NivelRubrica = { nivel: 0 | 1 | 2 | 3 | 4; criterio: string };

export type ItemProva = {
  id: string;
  /** Código do descritor (OMNI-…, ENEM, BNCC). */
  codigo: string;
  /** 1 = com apoio no próprio item; 2 = sem apoio. */
  ordem: 1 | 2;
  tipo: TipoItem;
  texto_base?: string;
  enunciado: string;
  alternativas?: Alternativa[];
  gabarito?: Letra;
  /** Abertas e observação: o que indica cada nível. */
  rubrica?: NivelRubrica[];
  /** Para a professora: o que observar durante a aplicação. */
  observar?: string;
};

export type Adaptacoes = {
  /** Tamanho da letra no caderno do estudante. */
  fonte: "normal" | "ampliada" | "grande";
  umaPorPagina: boolean;
  /** Linhas para resposta nas abertas. */
  linhasResposta: number;
};

export const ADAPTACOES_PADRAO: Adaptacoes = { fonte: "normal", umaPorPagina: false, linhasResposta: 5 };

export type RespostaItem = {
  /** Letra marcada (objetiva); null = em branco. */
  marcada?: Letra | null;
  /** Nível 0–4 dado pela rubrica (aberta/observação). */
  nivel?: number | null;
  apoio: ApoioDado;
  /** De onde veio a resposta. */
  fonte: "grade" | "foto" | "rubrica" | "ia";
  /** Foto lida com dúvida (duas marcas ou marca fraca): a professora confere. */
  conferir?: boolean;
  nota_ia?: string;
};

export type Prova = {
  id: string;
  codigo_curto: string;
  tipo: "diagnostica" | "processual";
  student_id: string;
  disciplina: string;
  ano_referencia: string | null;
  descritores: Array<{ codigo: string; descritor: string }>;
  itens: ItemProva[];
  adaptacoes: Adaptacoes;
  respostas: Record<string, RespostaItem>;
  created_at?: string;
  updated_at?: string;
};

export type ResultadoDescritor = {
  codigo: string;
  descritor: string;
  nivel: number | null;
  /** Texto curto para o campo "o que você observou". */
  evidencia: string;
  completo: boolean;
};

// ─── Correção ──────────────────────────────────────────────────────────────

export function itemCerto(item: ItemProva, r?: RespostaItem): boolean | null {
  if (!r) return null;
  if (item.tipo === "objetiva") {
    if (r.marcada === undefined) return null;
    return !!r.marcada && r.marcada === item.gabarito;
  }
  if (typeof r.nivel !== "number") return null;
  return r.nivel >= 3;
}

function respondido(item: ItemProva, r?: RespostaItem): boolean {
  if (!r) return false;
  return item.tipo === "objetiva" ? r.marcada !== undefined : typeof r.nivel === "number";
}

/**
 * Nível sugerido de um descritor a partir dos seus itens (regra da Omnisfera, apoio + acerto):
 * - acertou o item sem apoio (2º) sozinho, e o 1º também → 4; acertou o 2º só com apoio leve, ou errou o 1º → 3;
 * - acertou o 2º só com apoio total, ou só o 1º (que já traz apoio) sem ajuda ou com ajuda leve → 2;
 * - acertou só o 1º com apoio total, ou tentou e errou → 1;
 * - não respondeu nada, nem com apoio → 0.
 * Nas abertas/observação, vale o nível da rubrica, rebaixado se precisou de apoio.
 */
export function nivelSugerido(itens: ItemProva[], respostas: Record<string, RespostaItem>): number | null {
  if (!itens.length || !itens.every((i) => respondido(i, respostas[i.id]))) return null;
  const abertas = itens.filter((i) => i.tipo !== "objetiva");
  if (abertas.length === itens.length) {
    const niveis = abertas.map((i) => {
      const r = respostas[i.id]!;
      const n = r.nivel as number;
      return Math.max(0, n - (r.apoio === "total" ? 2 : r.apoio === "leve" ? 1 : 0));
    });
    return Math.max(...niveis);
  }
  const i1 = itens.find((i) => i.ordem === 1) || itens[0];
  const i2 = itens.find((i) => i.ordem === 2 && i !== i1);
  const r1 = respostas[i1.id]!;
  const c1 = itemCerto(i1, r1);
  if (i2) {
    const r2 = respostas[i2.id]!;
    if (itemCerto(i2, r2)) {
      if (r2.apoio === "nenhum") return c1 ? 4 : 3;
      if (r2.apoio === "leve") return 3;
      return 2;
    }
  }
  if (c1) return r1.apoio === "total" ? 1 : 2;
  const tentou = itens.some((i) => {
    const r = respostas[i.id];
    return i.tipo === "objetiva" ? !!r?.marcada : (r?.nivel ?? 0) > 0;
  });
  return tentou ? 1 : 0;
}

const APOIO_TXT: Record<ApoioDado, string> = { nenhum: "sem apoio", leve: "com apoio leve", total: "com apoio total" };

function descreverResposta(item: ItemProva, r: RespostaItem | undefined, n: number): string {
  if (!r || !respondido(item, r)) return `Q${n} sem resposta`;
  if (item.tipo === "objetiva") {
    if (!r.marcada) return `Q${n} em branco (${APOIO_TXT[r.apoio]})`;
    return `Q${n} ${r.marcada === item.gabarito ? "certa" : `errada (marcou ${r.marcada})`} ${APOIO_TXT[r.apoio]}`;
  }
  return `Q${n} nível ${r.nivel} na rubrica ${APOIO_TXT[r.apoio]}`;
}

/** Nível sugerido e evidência de cada descritor da prova. */
export function corrigirProva(prova: Pick<Prova, "descritores" | "itens" | "respostas">): ResultadoDescritor[] {
  let numero = 0;
  const numeros = new Map(prova.itens.map((i) => [i.id, ++numero]));
  return prova.descritores.map((d) => {
    const itens = prova.itens.filter((i) => i.codigo === d.codigo).sort((a, b) => a.ordem - b.ordem);
    const nivel = nivelSugerido(itens, prova.respostas);
    const partes = itens.map((i) => descreverResposta(i, prova.respostas[i.id], numeros.get(i.id) || 0));
    return {
      codigo: d.codigo,
      descritor: d.descritor,
      nivel,
      evidencia: `Prova em papel: ${partes.join("; ")}.`,
      completo: nivel !== null,
    };
  });
}

// ─── Itens vindos da IA ────────────────────────────────────────────────────

const limpa = (s: unknown, max = 1200) => String(s ?? "").replace(/\s+/g, " ").trim().slice(0, max);

/** Valida e normaliza os itens que a IA devolveu (JSON). Itens quebrados ficam de fora. */
export function normalizarItens(bruto: unknown, codigosValidos: string[], gerarId: () => string): ItemProva[] {
  const lista = Array.isArray(bruto) ? bruto : Array.isArray((bruto as { itens?: unknown })?.itens) ? (bruto as { itens: unknown[] }).itens : [];
  const saida: ItemProva[] = [];
  for (const b of lista as Record<string, unknown>[]) {
    const codigo = String(b?.codigo || "");
    if (!codigosValidos.includes(codigo)) continue;
    const tipo: TipoItem = b.tipo === "aberta" || b.tipo === "observacao" ? b.tipo : "objetiva";
    const enunciado = limpa(b.enunciado);
    if (!enunciado) continue;
    const ordem: 1 | 2 = Number(b.ordem) === 2 ? 2 : 1;
    const item: ItemProva = { id: gerarId(), codigo, ordem, tipo, enunciado };
    const base = limpa(b.texto_base, 2400);
    if (base) item.texto_base = base;
    const obs = limpa(b.observar, 400);
    if (obs) item.observar = obs;
    if (tipo === "objetiva") {
      const alts = (Array.isArray(b.alternativas) ? b.alternativas : []) as Record<string, unknown>[];
      const alternativas: Alternativa[] = alts.slice(0, 4).map((a, i) => ({
        letra: LETRAS[i],
        texto: limpa(typeof a === "string" ? a : a?.texto, 400),
        ...(typeof a === "object" && a?.erro ? { erro: limpa(a.erro, 200) } : {}),
      })).filter((a) => a.texto);
      const gab = String(b.gabarito || "").trim().toUpperCase().charAt(0) as Letra;
      if (alternativas.length < 3 || !alternativas.some((a) => a.letra === gab)) continue;
      item.alternativas = alternativas;
      item.gabarito = gab;
    } else {
      const rub = (Array.isArray(b.rubrica) ? b.rubrica : []) as Record<string, unknown>[];
      const rubrica = rub.map((r) => ({ nivel: Math.max(0, Math.min(4, Math.round(Number(r?.nivel)))) as NivelRubrica["nivel"], criterio: limpa(r?.criterio, 240) }))
        .filter((r) => r.criterio && Number.isFinite(r.nivel));
      item.rubrica = rubrica.length ? rubrica : RUBRICA_PADRAO;
    }
    saida.push(item);
  }
  // no máximo 2 itens por descritor, um de cada ordem
  const vistos = new Set<string>();
  return saida.filter((i) => {
    const k = `${i.codigo}:${i.ordem}`;
    if (vistos.has(k)) return false;
    vistos.add(k);
    return true;
  });
}

export const RUBRICA_PADRAO: NivelRubrica[] = [
  { nivel: 0, criterio: "Não respondeu, nem com mediação." },
  { nivel: 1, criterio: "Reagiu ao tema, sem uma resposta reconhecível." },
  { nivel: 2, criterio: "Respondeu em parte, com erros importantes ou só com apoio contínuo." },
  { nivel: 3, criterio: "Respondeu quase tudo certo, com pequenos deslizes ou apoio pontual." },
  { nivel: 4, criterio: "Respondeu certo e completo, com autonomia." },
];

/** Extrai o primeiro JSON de um texto de IA (às vezes vem com ``` ou texto antes). */
export function extrairJson(texto: string): unknown {
  const limpo = texto.replace(/```(?:json)?/gi, "").trim();
  const ini = Math.min(...["[", "{"].map((c) => (limpo.indexOf(c) < 0 ? Infinity : limpo.indexOf(c))));
  if (!Number.isFinite(ini)) return null;
  const fecha = limpo[ini] === "[" ? "]" : "}";
  const fim = limpo.lastIndexOf(fecha);
  if (fim <= ini) return null;
  try {
    return JSON.parse(limpo.slice(ini, fim + 1));
  } catch {
    return null;
  }
}

/** Código curto impresso na folha (6 caracteres, sem letras que confundem). */
export function codigoCurto(rand: () => number = Math.random): string {
  const abc = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => abc[Math.floor(rand() * abc.length)]).join("");
}
