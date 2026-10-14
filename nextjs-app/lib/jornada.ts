/**
 * A jornada da professora do AEE (Atendimento Educacional Especializado), num lugar só.
 * Cada etapa diz para onde a pessoa vai depois, para nenhum módulo virar beco sem saída.
 * Usada pelo componente ProximosPassos e pelos tutoriais (passo a passo de cada tela).
 */

export type EtapaId = "estudantes" | "pei" | "paee" | "hub" | "diario" | "avaliacao" | "evolucao" | "pei-professor" | "plano-de-ensino";

export type Permissao = "can_estudantes" | "can_pei" | "can_pei_professor" | "can_paee" | "can_hub" | "can_diario" | "can_avaliacao" | "can_gestao";

export type Etapa = {
  id: EtapaId;
  rota: string;
  titulo: string;
  /** Frase curta do que a pessoa faz nessa etapa. */
  resumo: string;
  permissao: Permissao;
  /** Para onde a jornada segue, em ordem de prioridade. */
  depois: EtapaId[];
};

export const JORNADA: Record<EtapaId, Etapa> = {
  estudantes: { id: "estudantes", rota: "/estudantes", titulo: "Estudantes", resumo: "Cadastre o estudante e abra a ficha dele.", permissao: "can_estudantes", depois: ["pei"] },
  pei: { id: "pei", rota: "/pei", titulo: "PEI", resumo: "Estudo de caso, barreiras, metas e estratégias do estudante.", permissao: "can_pei", depois: ["paee", "avaliacao", "hub"] },
  paee: { id: "paee", rota: "/paee", titulo: "Planejar o AEE (PAEE)", resumo: "Transforme as metas do PEI em ciclos de atendimento.", permissao: "can_paee", depois: ["diario", "hub"] },
  hub: { id: "hub", rota: "/hub", titulo: "Criar materiais no Hub", resumo: "Atividades e recursos adaptados ao PEI do estudante.", permissao: "can_hub", depois: ["diario", "paee"] },
  diario: { id: "diario", rota: "/diario", titulo: "Registrar no Diário de bordo", resumo: "Anote cada atendimento: o que fez e como o estudante respondeu.", permissao: "can_diario", depois: ["avaliacao", "evolucao"] },
  avaliacao: { id: "avaliacao", rota: "/avaliacao-diagnostica", titulo: "Avaliar", resumo: "Diagnóstica no começo e processual a cada período, descritor por descritor.", permissao: "can_avaliacao", depois: ["evolucao", "pei"] },
  evolucao: { id: "evolucao", rota: "/evolucao", titulo: "Ver a evolução", resumo: "Avaliações, diário e PAEE juntos, para decidir os próximos passos.", permissao: "can_avaliacao", depois: ["pei", "paee"] },
  "pei-professor": { id: "pei-professor", rota: "/pei-professor", titulo: "PEI do professor", resumo: "Leia o PEI, dê ciência e faça a parte da sua disciplina.", permissao: "can_pei_professor", depois: ["hub", "avaliacao"] },
  "plano-de-ensino": { id: "plano-de-ensino", rota: "/plano-de-ensino", titulo: "Plano de ensino", resumo: "O planejamento do componente, que o PEI da disciplina adapta.", permissao: "can_pei_professor", depois: ["pei-professor", "hub"] },
};

/** Rótulo especial quando se volta ao PEI depois de avaliar (é a revisão, não o começo). */
const VOLTA_AO_PEI: Partial<Record<EtapaId, { titulo: string; resumo: string; sufixo: string }>> = {
  avaliacao: { titulo: "Revisar o PEI", resumo: "Os níveis da avaliação viram sugestão de meta no PEI.", sufixo: "&etapa=4" },
  evolucao: { titulo: "Revisar o PEI", resumo: "Ajuste metas e estratégias com o que a evolução mostrou.", sufixo: "&etapa=4" },
};

export type Passo = { id: EtapaId; href: string; titulo: string; resumo: string };

/** Os próximos passos a partir de uma etapa, só com o que a pessoa pode abrir. */
export function proximosPassos(atual: EtapaId, pode: Partial<Record<Permissao, boolean>>, studentId?: string | null, max = 2): Passo[] {
  const q = studentId ? `?student=${encodeURIComponent(studentId)}` : "";
  return JORNADA[atual].depois
    .map((id) => JORNADA[id])
    .filter((e) => pode[e.permissao])
    .slice(0, max)
    .map((e) => {
      const volta = e.id === "pei" ? VOLTA_AO_PEI[atual] : undefined;
      return {
        id: e.id,
        href: `${e.rota}${q}${volta && q ? volta.sufixo : ""}`,
        titulo: volta?.titulo ?? e.titulo,
        resumo: volta?.resumo ?? e.resumo,
      };
    });
}
