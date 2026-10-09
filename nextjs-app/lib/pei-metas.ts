/**
 * Onda 16 (10/10/2026): as metas e as barreiras do PEI como dados, para o PAEE e as outras
 * telas lerem sem adivinhar. Antes o PAEE procurava `pei_data.metas` (que o PEI nunca grava),
 * caía num leitor de texto e, sem achar, inventava uma meta genérica.
 */
import type { MetaPei } from "@/lib/paee";
import { extrairMetasEstruturadas } from "@/app/(dashboard)/pei/lib/dashboard-helpers";

type PeiData = Record<string, unknown> | null | undefined;

const PRAZOS: Array<["Curto" | "Medio" | "Longo", string, string]> = [
  ["Curto", "CURTO PRAZO", "alta"],
  ["Medio", "MÉDIO PRAZO", "media"],
  ["Longo", "LONGO PRAZO", "baixa"],
];

/** Metas do PEI, na ordem: metas gravadas → metas SMART do texto do PEI → metas das disciplinas consolidadas. */
export function metasDoPei(pei: PeiData): MetaPei[] {
  if (!pei) return [];
  if (Array.isArray(pei.metas) && pei.metas.length) {
    return (pei.metas as Array<Record<string, unknown>>)
      .map((m, i) => ({
        id: String(m.id || `meta_${String(i + 1).padStart(3, "0")}`),
        tipo: String(m.tipo || "GERAL"),
        descricao: String(m.descricao || m.objetivo || m.meta || "").trim(),
        prioridade: String(m.prioridade || "media"),
        selecionada: m.selecionada !== false,
      }))
      .filter((m) => m.descricao);
  }

  const metas: MetaPei[] = [];
  const smart = extrairMetasEstruturadas(typeof pei.ia_sugestao === "string" ? pei.ia_sugestao : undefined);
  for (const [chave, tipo, prioridade] of PRAZOS) {
    const texto = (smart[chave] || "").trim();
    if (texto && texto !== "Definir...") {
      metas.push({ id: `meta_${chave.toLowerCase()}`, tipo, descricao: texto.slice(0, 300), prioridade, selecionada: true });
    }
  }

  const cons = pei.consolidacao as { disciplinas?: Array<{ disciplina?: string; metas?: string[] }> } | undefined;
  for (const d of cons?.disciplinas || []) {
    (d.metas || []).filter(Boolean).slice(0, 3).forEach((m, i) => {
      metas.push({
        id: `meta_${(d.disciplina || "disc").toLowerCase().replace(/[^a-z0-9]+/g, "_")}_${i + 1}`,
        tipo: (d.disciplina || "DISCIPLINA").toUpperCase(),
        descricao: String(m).slice(0, 300),
        prioridade: "media",
        selecionada: true,
      });
    });
  }
  return metas.slice(0, 12);
}

export type BarreiraPei = { dominio: string; barreira: string; nivel: string | null };

/** Barreiras marcadas no PEI, com o nível de suporte de cada uma (a chave do nível é `${dominio}_${barreira}`). */
export function barreirasDoPei(pei: PeiData): BarreiraPei[] {
  if (!pei) return [];
  const sel = (pei.barreiras_selecionadas || {}) as Record<string, unknown>;
  const niveis = (pei.niveis_suporte || {}) as Record<string, string>;
  const lista: BarreiraPei[] = [];
  for (const [dominio, itens] of Object.entries(sel)) {
    if (!Array.isArray(itens)) continue;
    for (const b of itens) {
      if (typeof b !== "string" || !b) continue;
      lista.push({ dominio, barreira: b, nivel: niveis[`${dominio}_${b}`] || null });
    }
  }
  return lista;
}

/** Bloco de texto curto para os prompts do PAEE: metas, barreiras com nível e potencialidades. */
export function contextoEstruturadoDoPei(pei: PeiData): string {
  if (!pei) return "";
  const partes: string[] = [];
  const metas = metasDoPei(pei);
  if (metas.length) partes.push(`METAS DO PEI:\n${metas.map((m) => `- [${m.tipo}] ${m.descricao}`).join("\n")}`);
  const bar = barreirasDoPei(pei);
  if (bar.length) partes.push(`BARREIRAS MAPEADAS NO PEI (nível de suporte):\n${bar.map((b) => `- ${b.dominio}: ${b.barreira}${b.nivel ? ` (${b.nivel})` : ""}`).join("\n")}`);
  const pot = Array.isArray(pei.potencias) ? (pei.potencias as unknown[]).filter((x) => typeof x === "string" && x) : [];
  if (pot.length) partes.push(`POTENCIALIDADES: ${pot.join(", ")}`);
  if (typeof pei.hiperfoco === "string" && pei.hiperfoco.trim()) partes.push(`INTERESSE/HIPERFOCO: ${pei.hiperfoco.trim()}`);
  return partes.join("\n\n");
}
