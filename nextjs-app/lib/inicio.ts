/**
 * Início (onda 4 · home redesenhada): o que é de cada pessoa hoje.
 *
 * A home deixou de ser um painel com tudo para responder "o que eu faço agora?" (design system,
 * Princípios 3). As pendências saem dos estudantes do vínculo de quem está logado:
 *   - revisão do PEI vencida (quem edita PEI);
 *   - PEI vigente que o professor ainda não leu (ciência);
 *   - PEI em rascunho e estudante sem PEI (quem edita PEI);
 *   - revisão chegando nos próximos 15 dias.
 * Função pura para poder testar; a página busca os dados e chama esta função.
 */
import type { Vigencia } from "./estudo-caso";

export type TipoPendencia = "revisao_vencida" | "ciencia" | "rascunho" | "revisao_proxima" | "sem_pei";

export type Pendencia = {
  tipo: TipoPendencia;
  studentId: string;
  nome: string;
  serie: string | null;
  /** frase pronta para a tela */
  texto: string;
  /** rótulo do chip de estado */
  estado: string;
  acao: string;
  href: string;
};

export type EstudanteInicio = {
  id: string;
  name: string;
  grade: string | null;
  pei_data?: Record<string, unknown> | null;
};

const ORDEM: TipoPendencia[] = ["revisao_vencida", "ciencia", "rascunho", "revisao_proxima", "sem_pei"];

/** "2026-05-12" → "12/05" (mesmo ano) ou "12/05/2027" */
export function dataCurta(iso: string, hoje: string): string {
  const [a, m, d] = iso.slice(0, 10).split("-");
  if (!a || !m || !d) return iso;
  return a === hoje.slice(0, 4) ? `${d}/${m}` : `${d}/${m}/${a}`;
}

function somarDias(iso: string, dias: number): string {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}

// Campos do cadastro, que não contam como PEI começado
const CADASTRO = new Set(["nome", "serie", "turma", "matricula", "diagnostico", "nasc", "data_nascimento", "idade"]);

function temPei(pei: Record<string, unknown>): boolean {
  if (pei.vigencia) return true;
  return Object.entries(pei).some(
    ([k, v]) => !CADASTRO.has(k) && v != null && v !== "" && v !== false && !(Array.isArray(v) && v.length === 0) &&
      !(typeof v === "object" && !Array.isArray(v) && Object.keys(v as object).length === 0)
  );
}

export function pendenciasDoInicio(
  estudantes: EstudanteInicio[],
  opcoes: { editaPei: boolean; cientes: Set<string> | null; hoje: string }
): Pendencia[] {
  const { editaPei, cientes, hoje } = opcoes;
  const limiteProxima = somarDias(hoje, 15);
  const out: Pendencia[] = [];

  for (const s of estudantes) {
    const pei = (s.pei_data || {}) as Record<string, unknown>;
    const vig = pei.vigencia as Vigencia | undefined;
    const base = { studentId: s.id, nome: s.name, serie: s.grade };
    const valendo = vig && (vig.status === "vigente" || vig.status === "em_revisao") && vig.versao > 0;

    // Ciência: professor do vínculo que ainda não leu a versão atual
    if (cientes && valendo && !cientes.has(`${s.id}:${vig.versao}`)) {
      out.push({
        ...base, tipo: "ciencia", estado: "Para ler",
        texto: `Ler o PEI de ${s.name} (versão ${vig.versao}) e dar ciência`,
        acao: "Ler e dar ciência", href: "/pei-regente",
      });
    }

    if (!editaPei) continue;

    if (vig?.status === "vigente" && vig.proxima_revisao && vig.proxima_revisao < hoje) {
      out.push({
        ...base, tipo: "revisao_vencida", estado: "Revisão vencida",
        texto: `A revisão do PEI de ${s.name} venceu em ${dataCurta(vig.proxima_revisao, hoje)}`,
        acao: "Revisar", href: `/pei?student=${s.id}`,
      });
    } else if (vig?.status === "vigente" && vig.proxima_revisao && vig.proxima_revisao <= limiteProxima) {
      out.push({
        ...base, tipo: "revisao_proxima", estado: "Revisão chegando",
        texto: `A revisão do PEI de ${s.name} é em ${dataCurta(vig.proxima_revisao, hoje)}`,
        acao: "Abrir PEI", href: `/pei?student=${s.id}`,
      });
    } else if (vig?.status === "rascunho" || (!vig && temPei(pei))) {
      out.push({
        ...base, tipo: "rascunho", estado: "Rascunho",
        texto: `O PEI de ${s.name} ainda é rascunho`,
        acao: "Continuar", href: `/pei?student=${s.id}`,
      });
    } else if (!vig && !temPei(pei)) {
      out.push({
        ...base, tipo: "sem_pei", estado: "Sem PEI",
        texto: `${s.name} ainda não tem estudo de caso`,
        acao: "Começar", href: `/pei?student=${s.id}`,
      });
    }
  }

  return out.sort((a, b) => ORDEM.indexOf(a.tipo) - ORDEM.indexOf(b.tipo) || a.nome.localeCompare(b.nome, "pt-BR"));
}

/** Pendências que pedem ação (as outras são lembretes). */
export function pedemAtencao(p: Pendencia[]): number {
  return p.filter((x) => x.tipo === "revisao_vencida" || x.tipo === "ciencia" || x.tipo === "rascunho").length;
}

/** "Bom dia" / "Boa tarde" / "Boa noite" no horário de Brasília. */
export function saudacao(agora = new Date()): string {
  const h = Number(new Intl.DateTimeFormat("pt-BR", { hour: "numeric", hourCycle: "h23", timeZone: "America/Sao_Paulo" }).format(agora));
  return h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
}

/** "quinta-feira, 9 de outubro" */
export function dataPorExtenso(agora = new Date()): string {
  return new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long", timeZone: "America/Sao_Paulo" }).format(agora);
}

/** Data de hoje (aaaa-mm-dd) no horário de Brasília. */
export function hojeBrasilia(agora = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(agora);
}

export function primeiroNome(nome: string | null | undefined): string {
  const n = (nome || "").trim().split(/\s+/)[0] || "";
  return n ? n[0].toUpperCase() + n.slice(1) : "";
}
