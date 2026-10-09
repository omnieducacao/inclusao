/**
 * Onda 17: lê do disco a matriz de um componente/ano (só no servidor).
 * Omni (EF) → data/matriz-omni/<SIGLA>.json · ENEM (EM) → lib/matriz-enem · BNCC (opção no EM) → data/bncc_em.json.
 * A matriz antiga (data/matriz_diagnostica.json) só é lida aqui para o confronto de qualidade.
 */
import { readFile } from "fs/promises";
import { join } from "path";
import { descritoresDoAno, type ComponenteOmni } from "@/lib/matriz-omni";
import { areaEnem, type AreaEnem } from "@/lib/matriz-enem";
import { matrizSaeb } from "@/lib/matriz-saeb";
import { componenteOficial, matrizDoComponente, type Etapa, type FonteMatriz, type ItemMatriz } from "@/lib/matriz-avaliacao";

const cache = new Map<string, unknown>();
async function lerJson<T>(...partes: string[]): Promise<T | null> {
  const caminho = join(process.cwd(), "data", ...partes);
  if (cache.has(caminho)) return cache.get(caminho) as T;
  try {
    const dado = JSON.parse(await readFile(caminho, "utf8")) as T;
    cache.set(caminho, dado);
    return dado;
  } catch {
    return null;
  }
}

export async function versaoMatrizOmni(): Promise<string> {
  const idx = await lerJson<{ versao?: string }>("matriz-omni", "indice.json");
  return idx?.versao || "omni";
}

function itensEnem(area: AreaEnem): ItemMatriz[] {
  const a = areaEnem(area);
  return a.competencias.flatMap((c) =>
    c.habilidades.map((h) => ({
      codigo: `${area}-H${h.h}`,
      ano: "Ensino Médio",
      eixo: `Competência ${c.n}`,
      descritor: h.texto,
      habilidades_bncc: [],
      saeb: [],
      evidencia: "",
    }))
  );
}

type HabBnccEm = { codigo: string; area_codigo?: string; area_conhecimento?: string; habilidade: string };
const AREA_BNCC_EM: Record<AreaEnem, string[]> = {
  LC: ["LGG", "LP"], MT: ["MAT"], CN: ["CNT"], CH: ["CHS"],
};

async function itensBnccEm(area: AreaEnem): Promise<ItemMatriz[]> {
  const todas = (await lerJson<HabBnccEm[]>("bncc_em.json")) || [];
  const prefixos = AREA_BNCC_EM[area];
  return todas
    .filter((h) => prefixos.some((p) => h.codigo?.startsWith(`EM13${p}`)))
    .map((h) => ({
      codigo: h.codigo,
      ano: "Ensino Médio",
      eixo: h.area_conhecimento || "",
      descritor: h.habilidade.replace(/^\(EM13[A-Z]+\d+\)\s*/, ""),
      habilidades_bncc: [h.codigo],
      saeb: [],
      evidencia: "",
    }));
}

/**
 * Itens da matriz para um componente, na etapa e no ano de referência.
 * `fonte` = "bncc" só no Ensino Médio (a BNCC fica como opção ao lado da Matriz do ENEM).
 */
export async function itensDaMatriz(opts: { componente: string; etapa: Etapa; ano: number | null; fonte?: FonteMatriz }): Promise<{ fonte: FonteMatriz; versao: string; itens: ItemMatriz[] } | null> {
  const qual = matrizDoComponente(opts.componente, opts.etapa);
  if (!qual) return null;
  if (qual.fonte === "omni") {
    const comp = await lerJson<ComponenteOmni>("matriz-omni", `${qual.chave}.json`);
    if (!comp || !opts.ano) return null;
    return { fonte: "omni", versao: await versaoMatrizOmni(), itens: descritoresDoAno(comp, `${opts.ano}º ano`) };
  }
  const area = qual.chave as AreaEnem;
  if (opts.fonte === "bncc") return { fonte: "bncc", versao: "bncc", itens: await itensBnccEm(area) };
  return { fonte: "enem", versao: "enem-inep", itens: itensEnem(area) };
}

/** Acha um item pelo código, em qualquer matriz (para validar o que a tela manda gravar). */
export async function itemPorCodigo(codigo: string, componente: string, etapa: Etapa, ano: number | null): Promise<ItemMatriz | null> {
  for (const fonte of ["omni", "enem", "bncc"] as FonteMatriz[]) {
    const r = await itensDaMatriz({ componente, etapa, ano, fonte });
    const it = r?.itens.find((i) => i.codigo === codigo);
    if (it) return it;
    if (r?.fonte === "omni") {
      // o ano de referência pode ser outro: procura no componente inteiro
      const comp = await lerJson<ComponenteOmni>("matriz-omni", `${matrizDoComponente(componente, etapa)?.chave}.json`);
      const d = comp?.descritores.find((x) => x.codigo === codigo);
      if (d) return d;
    }
  }
  return null;
}

/** SAEB oficial ligado ao descritor (LP e MA, 5º e 9º ano), para o prompt das questões. */
export function saebDoItem(componente: string, item: ItemMatriz): { codigo: string; texto: string }[] {
  if (!item.saeb.length) return [];
  const anoSaeb = /9º/.test(item.ano) || /[6-9]º/.test(item.ano) ? "9º ano" : "5º ano";
  const m = matrizSaeb(componenteOficial(componente), anoSaeb);
  return item.saeb.map((c) => m?.descritores.find((d) => d.codigo === c)).filter(Boolean).map((d) => ({ codigo: d!.codigo, texto: d!.texto }));
}

// ── Confronto de qualidade com a matriz antiga ─────────────────────────────

export type ItemLegado = { ref: string; serie: string; tema: string; habilidade: string; descritor: string };

const AREA_LEGADO: Record<string, string> = {
  "Matemática": "Matemática",
  "Língua Portuguesa": "Linguagens", "Arte": "Linguagens", "Educação Física": "Linguagens", "Língua Inglesa": "Linguagens",
  "Ciências": "Ciências da Natureza",
  "História": "Ciências Humanas", "Geografia": "Ciências Humanas",
};

/** Itens da matriz antiga para o componente e o ano (só existe do 4º ao 9º). */
export async function itensLegado(componente: string, ano: number): Promise<ItemLegado[]> {
  const dado = await lerJson<{ matrizes?: Record<string, Array<Record<string, string>>> }>("matriz_diagnostica.json");
  const area = AREA_LEGADO[componenteOficial(componente)];
  const lista = (area && dado?.matrizes?.[area]) || [];
  return lista
    .filter((i) => i.serie === `EF${ano}`)
    .map((i, n) => ({ ref: `${area}:EF${ano}:${n}`, serie: i.serie, tema: i.tema || "", habilidade: i.habilidade || "", descritor: i.descritor || "" }));
}

const palavras = (t: string) => new Set((t || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().match(/[a-z]{4,}/g) || []);

/** O item antigo mais parecido com o descritor Omni (por palavras em comum). */
export function maisParecido(descritor: ItemMatriz, legado: ItemLegado[]): { item: ItemLegado; semelhanca: number } | null {
  const alvo = palavras(`${descritor.descritor} ${descritor.eixo}`);
  let melhor: { item: ItemLegado; semelhanca: number } | null = null;
  for (const it of legado) {
    const p = palavras(`${it.habilidade} ${it.descritor} ${it.tema}`);
    const comuns = [...alvo].filter((w) => p.has(w)).length;
    const sem = comuns / Math.max(1, Math.min(alvo.size, p.size));
    if (!melhor || sem > melhor.semelhanca) melhor = { item: it, semelhanca: sem };
  }
  return melhor;
}
