/**
 * Onda 17 (10/10/2026): a matriz das avaliações diagnóstica e processual.
 * - Ensino Fundamental (1º ao 9º ano): Matriz Omni, a mesma do OmniProf (componente → ano → eixo
 *   → descritor, ligado à BNCC e, em LP e MA, ao SAEB).
 * - Ensino Médio: Matriz de Referência do ENEM (4 áreas, 120 habilidades); a BNCC fica como opção.
 * - Educação Infantil: sem matriz de descritores (a observação fica no PEI, por campos de experiência).
 * A escala 0–4 é a mesma da Omnisfera, texto por texto (ver ESCALA_OMNISFERA).
 * Este arquivo vai também para o navegador: nada de fs aqui (ver matriz-avaliacao-servidor.ts).
 */
import { siglaOmni } from "@/lib/matriz-omni";
import { areaEnemDaDisciplina, type AreaEnem } from "@/lib/matriz-enem";

export type FonteMatriz = "omni" | "enem" | "bncc";

/** Um item avaliável, venha de qual matriz vier. */
export type ItemMatriz = {
  codigo: string;
  ano: string;
  eixo: string;
  descritor: string;
  habilidades_bncc: string[];
  saeb: string[];
  evidencia: string;
};

/** O que fica gravado por descritor avaliado. */
export type DescritorAvaliado = {
  codigo: string;
  descritor: string;
  eixo: string;
  nivel: number | null;
  evidencia_observada?: string;
  fonte?: "observacao" | "itens";
};

export type Etapa = "EI" | "EF" | "EM";

export type SerieLida = { etapa: Etapa; ano: number | null; rotuloAno: string | null };

/** "7º Ano (EFAF)" → EF 7 · "2ª Série (EM)" → EM 2 · "Educação Infantil (5 anos)" → EI. */
export function lerSerie(grade: string | null | undefined): SerieLida {
  const g = (grade || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  if (!g) return { etapa: "EF", ano: null, rotuloAno: null };
  if (/infantil|creche|pre-?escola|\bei\b/.test(g)) return { etapa: "EI", ano: null, rotuloAno: null };
  const digito = /(\d)/.exec(g);
  const n = digito ? Number(digito[1]) : null;
  if (/serie|\bem\b|medio/.test(g)) return { etapa: "EM", ano: n, rotuloAno: n ? `${n}ª série` : null };
  if (n) return { etapa: "EF", ano: n, rotuloAno: `${n}º ano` };
  return { etapa: "EF", ano: null, rotuloAno: null };
}

const COMPONENTES_EF = ["Língua Portuguesa", "Matemática", "Ciências", "História", "Geografia", "Arte", "Educação Física", "Língua Inglesa"];
const COMPONENTES_EM = ["Língua Portuguesa", "Matemática", "Biologia", "Física", "Química", "História", "Geografia", "Filosofia", "Sociologia", "Arte", "Educação Física", "Língua Inglesa"];

export function componentesDaEtapa(etapa: Etapa): string[] {
  if (etapa === "EM") return COMPONENTES_EM;
  if (etapa === "EF") return COMPONENTES_EF;
  return [];
}

const APELIDOS: Array<[RegExp, string]> = [
  [/^(portugues|lingua portuguesa|l\.? ?portuguesa|lp)$/, "Língua Portuguesa"],
  [/^(matematica|mat)$/, "Matemática"],
  [/^(ciencias|ciencia|ciencias da natureza)$/, "Ciências"],
  [/^(historia|hist)$/, "História"],
  [/^(geografia|geo)$/, "Geografia"],
  [/^(arte|artes)$/, "Arte"],
  [/^(educacao fisica|ed\.? ?fisica)$/, "Educação Física"],
  [/^(ingles|lingua inglesa|l\.? ?inglesa)$/, "Língua Inglesa"],
  [/^biologia$/, "Biologia"], [/^fisica$/, "Física"], [/^quimica$/, "Química"],
  [/^filosofia$/, "Filosofia"], [/^sociologia$/, "Sociologia"],
];

/** Nome da disciplina como a escola escreve → nome oficial do componente. */
export function componenteOficial(nome: string): string {
  const n = (nome || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
  for (const [re, oficial] of APELIDOS) if (re.test(n)) return oficial;
  return (nome || "").trim();
}

/** Qual matriz vale para o componente nesta etapa, e por qual chave ela é lida. */
export function matrizDoComponente(componente: string, etapa: Etapa): { fonte: FonteMatriz; chave: string } | null {
  const c = componenteOficial(componente);
  if (etapa === "EF") {
    const sigla = siglaOmni(c);
    return sigla ? { fonte: "omni", chave: sigla } : null;
  }
  if (etapa === "EM") {
    const area: AreaEnem | null = areaEnemDaDisciplina(c);
    return area ? { fonte: "enem", chave: area } : null;
  }
  return null;
}

export const NOME_DA_FONTE: Record<FonteMatriz, string> = {
  omni: "Matriz Omni",
  enem: "Matriz de Referência do ENEM",
  bncc: "BNCC",
};

/** Nível do componente = mediana dos descritores avaliados (arredonda para baixo: pede mais apoio, não menos). */
export function nivelDoComponente(descritores: Array<{ nivel: number | null }>): number | null {
  const n = descritores.map((d) => d.nivel).filter((x): x is number => typeof x === "number").sort((a, b) => a - b);
  if (!n.length) return null;
  const meio = Math.floor((n.length - 1) / 2);
  return n.length % 2 ? n[meio] : Math.floor((n[meio] + n[meio + 1]) / 2);
}

/** Descritores com nível 0 a 2 viram sugestão de meta no PEI. */
export function sugestoesDeMeta(componente: string, descritores: DescritorAvaliado[]): Array<{ componente: string; codigo: string; texto: string; nivel: number }> {
  return descritores
    .filter((d) => typeof d.nivel === "number" && d.nivel <= 2)
    .sort((a, b) => (a.nivel as number) - (b.nivel as number))
    .map((d) => ({ componente, codigo: d.codigo, texto: d.descritor, nivel: d.nivel as number }));
}
