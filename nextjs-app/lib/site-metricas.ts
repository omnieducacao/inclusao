/**
 * Resumo dos eventos do site para o painel (onda 57). Função pura: recebe as linhas de site_eventos
 * (e alguns totais de leads e certificados) e devolve números prontos para a aba "Site e funil".
 */

export type LinhaEvento = {
  criado_em: string; tipo: "visita" | "clique" | "marco"; pagina: string; alvo: string | null;
  origem: string | null; visitante: string | null; dispositivo: string | null;
};

export type Contagem = { chave: string; visitas: number; pessoas: number };

/** Nomes legíveis para os cliques e marcos que o site manda. */
export const ROTULOS: Record<string, string> = {
  "demonstracao": "Ver a demonstração",
  "contato": "Falar com a equipe",
  "conheca": "A semana da Beatriz",
  "formacao": "Formação",
  "omniprof": "OmniProf",
  "whatsapp": "Compartilhar no WhatsApp",
  "plataforma": "Conhecer a plataforma",
  "entrar": "Entrar na plataforma",
  "certificado:liberado": "Certificado liberado (trilha concluída)",
  "certificado:emitido": "Certificado emitido",
  "conheca:fim": "Chegou ao fim da história",
};

export function rotulo(chave: string): string {
  if (ROTULOS[chave]) return ROTULOS[chave];
  const m = chave.match(/^conheca:cena:(\d+)$/);
  if (m) return `História: cena ${m[1]}`;
  const t = chave.match(/^formacao:tema:(.+)$/);
  if (t) return `Tema concluído: ${t[1]}`;
  return chave;
}

function contar(linhas: LinhaEvento[], chave: (l: LinhaEvento) => string | null): Contagem[] {
  const m = new Map<string, { v: number; p: Set<string> }>();
  for (const l of linhas) {
    const k = chave(l);
    if (!k) continue;
    const e = m.get(k) || { v: 0, p: new Set<string>() };
    e.v++;
    if (l.visitante) e.p.add(`${l.visitante}`);
    m.set(k, e);
  }
  return [...m.entries()].map(([k, e]) => ({ chave: k, visitas: e.v, pessoas: e.p.size })).sort((a, b) => b.pessoas - a.pessoas || b.visitas - a.visitas);
}

/** Dia no fuso de Brasília, "2026-10-16". */
export function diaBR(iso: string): string {
  return new Date(new Date(iso).getTime() - 3 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

export function resumirSite(linhas: LinhaEvento[], extras: { demonstracoes: number; contatos: number; certificados: number }, dias: number, hoje = new Date()) {
  // visitante muda a cada dia: pessoa = visitante + dia
  const comPessoa = linhas.map((l) => ({ ...l, visitante: l.visitante ? `${l.visitante}:${diaBR(l.criado_em)}` : null }));
  const visitas = comPessoa.filter((l) => l.tipo === "visita");
  const cliques = comPessoa.filter((l) => l.tipo === "clique");
  const marcos = comPessoa.filter((l) => l.tipo === "marco");
  const pessoas = (ls: typeof comPessoa) => new Set(ls.map((l) => l.visitante).filter(Boolean)).size;

  const porDia: { dia: string; visitas: number; pessoas: number }[] = [];
  for (let i = dias - 1; i >= 0; i--) {
    const d = diaBR(new Date(hoje.getTime() - i * 86400000).toISOString());
    const doDia = visitas.filter((l) => diaBR(l.criado_em) === d);
    porDia.push({ dia: d, visitas: doDia.length, pessoas: pessoas(doDia) });
  }

  const quemVisitou = (pred: (p: string) => boolean) => pessoas(visitas.filter((l) => pred(l.pagina)));
  const quemMarcou = (pred: (a: string) => boolean) => pessoas(marcos.filter((l) => l.alvo && pred(l.alvo)));
  const quemClicou = (pred: (a: string) => boolean) => pessoas(cliques.filter((l) => l.alvo && pred(l.alvo)));

  const funil = [
    { etapa: "Visitaram o site", pessoas: pessoas(visitas) },
    { etapa: "Abriram a história da Beatriz", pessoas: quemVisitou((p) => p.startsWith("/conheca")) },
    { etapa: "Chegaram ao fim da história", pessoas: quemMarcou((a) => a === "conheca:fim") },
    { etapa: "Clicaram em ver a demonstração", pessoas: quemClicou((a) => a === "demonstracao") },
    { etapa: "Entraram na demonstração", pessoas: extras.demonstracoes },
    { etapa: "Pediram contato", pessoas: extras.contatos },
  ];
  const formacao = [
    { etapa: "Abriram a formação", pessoas: quemVisitou((p) => p.startsWith("/formacao")) },
    { etapa: "Concluíram ao menos um tema", pessoas: quemMarcou((a) => a.startsWith("formacao:tema:")) },
    { etapa: "Liberaram o certificado", pessoas: quemMarcou((a) => a === "certificado:liberado") },
    { etapa: "Emitiram o certificado", pessoas: extras.certificados },
  ];
  const cenas = contar(marcos, (l) => (l.alvo && /^conheca:cena:\d+$/.test(l.alvo) ? l.alvo : null))
    .sort((a, b) => Number(a.chave.split(":")[2]) - Number(b.chave.split(":")[2]));

  return {
    dias,
    totais: { pessoas: pessoas(visitas), visitas: visitas.length, cliques: cliques.length, celular: pessoas(visitas.filter((l) => l.dispositivo === "celular")) },
    porDia,
    paginas: contar(visitas, (l) => l.pagina).slice(0, 15),
    origens: contar(visitas, (l) => l.origem || "Direto ou WhatsApp"),
    cliques: contar(cliques, (l) => l.alvo).slice(0, 15).map((c) => ({ ...c, rotulo: rotulo(c.chave) })),
    funil, formacao,
    cenas: cenas.map((c) => ({ ...c, rotulo: rotulo(c.chave) })),
  };
}
