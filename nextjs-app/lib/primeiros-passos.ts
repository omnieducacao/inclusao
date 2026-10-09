/**
 * Primeiros passos da escola (onda 11).
 * Substitui o tour guiado e os guias "Bem-vindo ao…" de cada módulo: a coordenação vê, no
 * Início, o que falta para a escola começar, na ordem certa, até tudo estar feito.
 */
export type ContagemEscola = { anosLetivos: number; turmas: number; equipe: number; estudantes: number; peisVigentes: number };

export type PassoEscola = { id: string; titulo: string; texto: string; href: string; acao: string; feito: boolean };

export function primeirosPassos(c: ContagemEscola): PassoEscola[] {
  return [
    { id: "turmas", titulo: "Ano letivo e turmas", texto: "Cadastre o ano letivo e as turmas. Elas ligam estudantes e professores.", href: "/config-escola", acao: "Cadastrar turmas", feito: c.anosLetivos > 0 && c.turmas > 0 },
    { id: "equipe", titulo: "Equipe", texto: "Convide professores e AEE e diga o que cada um pode fazer.", href: "/gestao", acao: "Convidar a equipe", feito: c.equipe > 0 },
    { id: "estudantes", titulo: "Estudantes", texto: "Cadastre os estudantes público da educação especial, já na turma.", href: "/estudantes?novo=1", acao: "Cadastrar estudante", feito: c.estudantes > 0 },
    { id: "pei", titulo: "Primeiro PEI", texto: "Faça o estudo de caso e torne o primeiro PEI vigente.", href: "/pei", acao: "Abrir o PEI", feito: c.peisVigentes > 0 },
  ];
}

/** Mostra enquanto houver passo por fazer. */
export function mostrarPrimeirosPassos(passos: PassoEscola[]): boolean {
  return passos.some((p) => !p.feito);
}
