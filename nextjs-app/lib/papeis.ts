/**
 * Papéis com nome (onda 1 · fundação).
 *
 * O papel diz quem a pessoa é na escola. As permissões (can_*) continuam dizendo o que ela
 * pode abrir: ao escolher o papel, a Gestão sugere as permissões e o vínculo daquele papel,
 * e a coordenação pode ajustar caso a caso.
 */
export type Papel = "direcao" | "coordenacao" | "professor" | "aee" | "apoio";

export type Permissoes = {
  can_estudantes: boolean;
  can_pei: boolean;
  can_pei_professor: boolean;
  can_paee: boolean;
  can_hub: boolean;
  can_diario: boolean;
  can_avaliacao: boolean;
  can_gestao: boolean;
};

export const PAPEIS: Array<{
  id: Papel;
  nome: string;
  descricao: string;
  vinculo: "todos" | "turma" | "tutor";
  permissoes: Permissoes;
}> = [
  {
    id: "direcao",
    nome: "Direção",
    descricao: "Acompanha a escola toda e a gestão inclusiva.",
    vinculo: "todos",
    permissoes: { can_estudantes: true, can_pei: true, can_pei_professor: false, can_paee: true, can_hub: true, can_diario: true, can_avaliacao: true, can_gestao: true },
  },
  {
    id: "coordenacao",
    nome: "Coordenação",
    descricao: "Faz o estudo de caso, abre o PEI e consolida a parte de cada professor.",
    vinculo: "todos",
    permissoes: { can_estudantes: true, can_pei: true, can_pei_professor: false, can_paee: true, can_hub: true, can_diario: true, can_avaliacao: true, can_gestao: true },
  },
  {
    id: "professor",
    nome: "Professor",
    descricao: "Faz a parte do PEI da sua disciplina e usa as ferramentas com os seus estudantes.",
    vinculo: "turma",
    permissoes: { can_estudantes: false, can_pei: false, can_pei_professor: true, can_paee: false, can_hub: true, can_diario: true, can_avaliacao: true, can_gestao: false },
  },
  {
    id: "aee",
    nome: "Professor do AEE",
    descricao: "Atendimento Educacional Especializado: planeja e registra o AEE (PAEE) e acompanha o PEI.",
    vinculo: "tutor",
    permissoes: { can_estudantes: true, can_pei: true, can_pei_professor: false, can_paee: true, can_hub: true, can_diario: true, can_avaliacao: true, can_gestao: false },
  },
  {
    id: "apoio",
    nome: "Profissional de apoio",
    descricao: "Acompanha estudantes no dia a dia e registra no diário de bordo.",
    vinculo: "tutor",
    permissoes: { can_estudantes: false, can_pei: false, can_pei_professor: false, can_paee: false, can_hub: true, can_diario: true, can_avaliacao: false, can_gestao: false },
  },
];

export const PAPEL_IDS = PAPEIS.map((p) => p.id) as [Papel, ...Papel[]];

export function nomeDoPapel(id: string | null | undefined): string {
  return PAPEIS.find((p) => p.id === id)?.nome ?? "Professor";
}

export function papelPadrao(id: string | null | undefined) {
  return PAPEIS.find((p) => p.id === id) ?? PAPEIS[2];
}
