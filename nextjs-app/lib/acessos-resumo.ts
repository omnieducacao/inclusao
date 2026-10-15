/**
 * Resumo dos acessos para a aba "Acessos" do painel (onda 57). Função pura sobre as linhas da tabela acessos.
 */
export type LinhaAcesso = {
  criado_em: string; tipo: "login" | "demo_entrada" | "demo_pagina" | "demo_papel";
  workspace_id: string | null; workspace_nome: string | null; usuario_nome: string | null;
  papel: string | null; lead_id: string | null; rota: string | null; modulo: string | null;
};
export type LeadResumo = { id: string; nome: string | null; escola: string | null; email: string | null };

const ms = (iso: string) => new Date(iso).getTime();

export function resumirAcessos(linhas: LinhaAcesso[], leads: LeadResumo[]) {
  const ordem = [...linhas].sort((a, b) => ms(a.criado_em) - ms(b.criado_em));
  const logins = ordem.filter((l) => l.tipo === "login");

  const escolasMap = new Map<string, { escola: string; logins: number; pessoas: Set<string>; ultimo: string }>();
  const pessoasMap = new Map<string, { nome: string; escola: string; papel: string | null; logins: number; ultimo: string }>();
  for (const l of logins) {
    const ws = l.workspace_id || l.workspace_nome || "?";
    const e = escolasMap.get(ws) || { escola: l.workspace_nome || "Escola", logins: 0, pessoas: new Set<string>(), ultimo: l.criado_em };
    e.logins++; e.pessoas.add(l.usuario_nome || "?"); e.ultimo = l.criado_em; escolasMap.set(ws, e);
    const pk = `${ws}|${l.usuario_nome}`;
    const p = pessoasMap.get(pk) || { nome: l.usuario_nome || "?", escola: l.workspace_nome || "Escola", papel: l.papel, logins: 0, ultimo: l.criado_em };
    p.logins++; p.ultimo = l.criado_em; p.papel = l.papel; pessoasMap.set(pk, p);
  }

  // Demonstração: uma visita por contato (lead); sem contato, cada entrada é uma visita
  const porLead = new Map<string, LinhaAcesso[]>();
  let semLead = 0;
  for (const l of ordem.filter((x) => x.tipo !== "login")) {
    const k = l.lead_id || (l.tipo === "demo_entrada" ? `sem-${semLead++}` : null);
    if (!k) continue;
    porLead.set(k, [...(porLead.get(k) || []), l]);
  }
  const leadsPorId = new Map(leads.map((l) => [l.id, l]));
  const demos = [...porLead.entries()].map(([k, ls]) => {
    const lead = leadsPorId.get(k);
    const papeis = [...new Set(ls.filter((l) => l.tipo !== "demo_pagina").map((l) => l.papel).filter(Boolean))] as string[];
    const telas = [...new Set(ls.map((l) => l.modulo).filter(Boolean))] as string[];
    const minutos = Math.max(0, Math.round((ms(ls[ls.length - 1].criado_em) - ms(ls[0].criado_em)) / 60000));
    return {
      nome: lead?.nome || "Visitante", escola: lead?.escola || null, email: lead?.email || null,
      entrada: ls[0].criado_em, papeis, telas, paginas: ls.filter((l) => l.tipo === "demo_pagina").length, minutos,
    };
  }).sort((a, b) => ms(b.entrada) - ms(a.entrada));

  return {
    totais: {
      logins: logins.length, pessoas: pessoasMap.size, escolas: escolasMap.size, demonstracoes: demos.length,
      minutosMedioDemo: demos.length ? Math.round(demos.reduce((s, d) => s + d.minutos, 0) / demos.length) : 0,
    },
    escolas: [...escolasMap.values()].map((e) => ({ escola: e.escola, logins: e.logins, pessoas: e.pessoas.size, ultimo: e.ultimo })).sort((a, b) => ms(b.ultimo) - ms(a.ultimo)),
    pessoas: [...pessoasMap.values()].sort((a, b) => ms(b.ultimo) - ms(a.ultimo)).slice(0, 100),
    ultimosLogins: logins.slice(-50).reverse().map((l) => ({ quando: l.criado_em, nome: l.usuario_nome, escola: l.workspace_nome, papel: l.papel })),
    demos: demos.slice(0, 100),
  };
}
