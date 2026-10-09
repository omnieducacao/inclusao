/**
 * As quatro etapas do PEI (onda 7).
 *
 * Antes eram até 14 abas no mesmo nível (Início, Estudante, Evidências, Rede, Mapeamento, Plano,
 * Monitoramento, BNCC, Consultoria IA, Regentes, Consolidação, Vigência, Dashboard…), sem dizer
 * a ordem. Agora o PEI segue o caminho da escola:
 *   1. Estudo de caso → 2. PEI → 3. Vigente e ciência → 4. Revisão
 * Cada etapa agrupa as seções que já existiam; o modo da escola só muda quais seções aparecem.
 */
import type { Vigencia } from "./estudo-caso";

export type Etapa = 1 | 2 | 3 | 4;
export type SecaoId =
  | "estudante" | "estudo_caso" | "evidencias" | "rede" | "mapeamento"
  | "consultoria" | "bncc" | "plano"
  | "vigencia" | "regentes" | "consolidacao"
  | "revisao" | "acompanhamento";

export const ETAPAS: Array<{ n: Etapa; titulo: string; ajuda: string }> = [
  { n: 1, titulo: "Estudo de caso", ajuda: "Quem é o estudante, o que a escola observou e o que precisa mudar." },
  { n: 2, titulo: "PEI", ajuda: "O plano: objetivos, estratégias e habilidades, com apoio da IA." },
  { n: 3, titulo: "Vigente e ciência", ajuda: "O PEI passa a valer e os professores registram que leram." },
  { n: 4, titulo: "Revisão", ajuda: "O que avançou, o que muda e quando revisar de novo." },
];

const NOMES: Record<SecaoId, string> = {
  estudante: "Dados do estudante",
  estudo_caso: "Estudo de caso",
  evidencias: "Evidências",
  rede: "Rede de apoio",
  mapeamento: "Barreiras e potências",
  consultoria: "Texto do PEI",
  bncc: "Habilidades da BNCC",
  plano: "Plano de ação",
  vigencia: "Tornar vigente e ciência",
  regentes: "Professores regentes",
  consolidacao: "Consolidação",
  revisao: "Revisões",
  acompanhamento: "Acompanhamento",
};

export function secoesDaEtapa(etapa: Etapa, modo: "completo" | "simplificado"): Array<{ id: SecaoId; nome: string }> {
  const completo = modo === "completo";
  const ids: SecaoId[] =
    etapa === 1 ? ["estudo_caso", "estudante", ...(completo ? (["evidencias", "rede", "mapeamento"] as SecaoId[]) : [])]
    : etapa === 2 ? ["consultoria", "bncc", ...(completo ? (["plano"] as SecaoId[]) : [])]
    : etapa === 3 ? ["vigencia", ...(completo ? (["regentes", "consolidacao"] as SecaoId[]) : [])]
    : ["revisao", "acompanhamento"]; // onda 18: "Situação das metas" entrou no fim de Revisões
  return ids.map((id) => ({ id, nome: NOMES[id] }));
}

/** Links antigos (?tab=consultoria) caem na etapa e na seção certas. */
export function etapaDaAbaAntiga(tab: string | null | undefined): { etapa: Etapa; secao: SecaoId } | null {
  switch (tab) {
    case "inicio": case "estudo_caso": return { etapa: 1, secao: "estudo_caso" };
    case "estudante": return { etapa: 1, secao: "estudante" };
    case "evidencias": case "rede": case "mapeamento": return { etapa: 1, secao: tab };
    case "consultoria": case "bncc": case "plano": return { etapa: 2, secao: tab };
    case "monitoramento": return { etapa: 4, secao: "revisao" }; // onda 18: virou um bloco de Revisões
    case "vigencia": case "regentes": case "consolidacao": return { etapa: 3, secao: tab };
    case "revisao": return { etapa: 4, secao: "revisao" };
    case "dashboard": case "acompanhamento": return { etapa: 4, secao: "acompanhamento" };
    default: return null;
  }
}

function preenchido(v: unknown): boolean {
  if (v == null) return false;
  if (typeof v === "string") return v.trim() !== "";
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === "object") return Object.values(v as object).some(preenchido);
  return Boolean(v);
}

export type EstadoEtapa = { feito: boolean; texto: string };

/** O estado vem dos dados, não de onde a pessoa clicou (design system: Passos). */
export function estadoDasEtapas(pei: Record<string, unknown>, hoje: string): Record<Etapa, EstadoEtapa> {
  const ec = (pei.estudo_caso || {}) as { concluido_em?: string | null };
  const vig = pei.vigencia as Vigencia | undefined;
  const textoPei = preenchido(pei.ia_sugestao);
  const validado = textoPei && pei.status_validacao_pei !== "rascunho" && preenchido(pei.status_validacao_pei);
  const vigente = vig?.status === "vigente";
  const valeu = Boolean(vig && vig.versao > 0);
  const revisoes = Array.isArray(pei.revisoes) ? pei.revisoes.length : 0;

  // PEIs anteriores à marcação "concluído" do estudo de caso: se o PEI já foi validado ou já valeu,
  // o estudo de caso ficou para trás (antes aparecia "Preenchendo" num PEI vigente).
  const e1: EstadoEtapa = ec.concluido_em || validado || valeu ? { feito: true, texto: "Concluído" }
    : preenchido(pei.estudo_caso) || preenchido(pei.barreiras_selecionadas) ? { feito: false, texto: "Preenchendo" }
    : { feito: false, texto: "A fazer" };
  const e2: EstadoEtapa = validado || valeu ? { feito: true, texto: "Concluído" }
    : textoPei ? { feito: false, texto: "Revisar o texto" }
    : { feito: false, texto: "A fazer" };
  const e3: EstadoEtapa = vigente ? { feito: true, texto: `Vigente · versão ${vig!.versao}` }
    : vig?.status === "em_revisao" ? { feito: false, texto: "Em revisão" }
    : { feito: false, texto: "A fazer" };
  const e4: EstadoEtapa = !valeu ? { feito: false, texto: "Depois de vigente" }
    : vig?.proxima_revisao && vig.proxima_revisao < hoje ? { feito: false, texto: "Revisão vencida" }
    : revisoes > 0 ? { feito: true, texto: `${revisoes} ${revisoes === 1 ? "revisão" : "revisões"}` }
    : { feito: false, texto: vig?.proxima_revisao ? `Revisar até ${vig.proxima_revisao.split("-").reverse().join("/")}` : "A fazer" };
  return { 1: e1, 2: e2, 3: e3, 4: e4 };
}

/** Onde a pessoa deve começar ao abrir o PEI: a primeira etapa que ainda não está feita. */
export function etapaInicial(estados: Record<Etapa, EstadoEtapa>): Etapa {
  if (!estados[1].feito) return 1;
  if (!estados[2].feito) return 2;
  if (!estados[3].feito) return 3;
  return 4;
}
