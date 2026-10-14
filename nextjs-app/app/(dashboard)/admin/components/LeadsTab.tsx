"use client";

/**
 * Aba "Contatos" do admin (onda 39): pedidos de contato da home e entradas na demonstração.
 * Situação (novo, em conversa, fechado, descartado), anotações e exclusão (LGPD: a pessoa pode pedir).
 */
import { useEffect, useMemo, useState } from "react";
import { Download, Mail, Phone, Trash2 } from "lucide-react";
import { OmniLoader } from "@/components/OmniLoader";
import { MensagemAdmin, type Mensagem } from "./MensagemAdmin";
import { ROTULO_STATUS, STATUS_LEAD, type StatusLead } from "@/lib/leads";

type Lead = {
  id: string; nome: string; email: string; telefone: string | null; escola: string; cargo: string;
  tipo_instituicao: string | null; faixa_estudantes: string | null; cidade: string | null; uf: string | null;
  mensagem: string | null; origem: "contato" | "demonstracao"; papel_demo: string | null;
  modulos_vistos: string[] | null; status: StatusLead; notas: string | null; created_at: string;
};

const CLASSE: Record<StatusLead, string> = { novo: "omni-estado--info", em_conversa: "omni-estado--atencao", fechado: "omni-estado--sucesso", descartado: "omni-estado--neutro" };

function data(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function csv(leads: Lead[]) {
  const cols: (keyof Lead)[] = ["created_at", "nome", "email", "telefone", "escola", "cargo", "tipo_instituicao", "faixa_estudantes", "cidade", "uf", "origem", "papel_demo", "status", "mensagem", "notas"];
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [cols.join(";"), ...leads.map((l) => cols.map((c) => esc(l[c])).join(";"))].join("\n");
}

export function LeadsTab() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtro, setFiltro] = useState<StatusLead | "todos">("todos");
  const [mensagem, setMensagem] = useState<Mensagem | null>(null);
  const [apagar, setApagar] = useState<string | null>(null);

  async function carregar() {
    setCarregando(true);
    try {
      const res = await fetch("/api/admin/leads");
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setLeads(d.leads || []);
    } catch (e) {
      setMensagem({ tipo: "erro", texto: e instanceof Error && e.message ? e.message : "Não foi possível carregar os contatos." } as Mensagem);
    } finally {
      setCarregando(false);
    }
  }
  useEffect(() => { carregar(); }, []);

  async function mudar(id: string, campos: { status?: StatusLead; notas?: string }) {
    setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, ...campos } : l)));
    const res = await fetch("/api/admin/leads", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, ...campos }) });
    if (!res.ok) setMensagem({ tipo: "erro", texto: "Não foi possível salvar. Recarregue a página." } as Mensagem);
  }

  async function excluir(id: string) {
    const res = await fetch(`/api/admin/leads?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (res.ok) { setLeads((ls) => ls.filter((l) => l.id !== id)); setMensagem({ tipo: "sucesso", texto: "Contato apagado." } as Mensagem); }
    else setMensagem({ tipo: "erro", texto: "Não foi possível apagar." } as Mensagem);
    setApagar(null);
  }

  function baixar() {
    const blob = new Blob(["﻿" + csv(visiveis)], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `contatos-omnisfera-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  const visiveis = useMemo(() => (filtro === "todos" ? leads : leads.filter((l) => l.status === filtro)), [leads, filtro]);
  const contagem = (s: StatusLead) => leads.filter((l) => l.status === s).length;

  if (carregando) {
    return <p className="omni-apoio" role="status" style={{ display: "flex", alignItems: "center", gap: 8, padding: "48px 0", justifyContent: "center" }}><OmniLoader size={20} /> Carregando…</p>;
  }

  return (
    <section className="omni-cartao" aria-labelledby="leads-titulo" style={{ gap: 16 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", justifyContent: "space-between" }}>
        <h3 id="leads-titulo" style={{ font: "800 18px/24px var(--font-sans)", color: "var(--tinta)", margin: 0 }}>Contatos ({leads.length})</h3>
        <button type="button" className="omni-btn omni-btn--secundario omni-btn--pequeno" onClick={baixar} disabled={!visiveis.length}><Download aria-hidden /> Baixar planilha (CSV)</button>
      </div>
      <p className="omni-apoio" style={{ margin: 0 }}>Pedidos do formulário &quot;Falar com a equipe&quot; e cadastros de quem entrou na demonstração. Apague quando a pessoa pedir ou depois de 12 meses sem resposta.</p>
      <MensagemAdmin mensagem={mensagem} onFechar={() => setMensagem(null)} />

      <div role="group" aria-label="Filtrar por situação" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <button type="button" className="omni-chip" aria-pressed={filtro === "todos"} onClick={() => setFiltro("todos")}>Todos · {leads.length}</button>
        {STATUS_LEAD.map((s) => (
          <button key={s} type="button" className="omni-chip" aria-pressed={filtro === s} onClick={() => setFiltro(s)}>{ROTULO_STATUS[s]} · {contagem(s)}</button>
        ))}
      </div>

      {!visiveis.length && <p className="omni-apoio">Nenhum contato aqui ainda.</p>}

      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 12 }}>
        {visiveis.map((l) => (
          <li key={l.id} className="omni-cartao omni-cartao--plano" style={{ gap: 10 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", justifyContent: "space-between" }}>
              <strong style={{ font: "700 16px/22px var(--font-sans)", color: "var(--tinta)" }}>{l.nome} · {l.cargo}</strong>
              <span className={`omni-estado ${CLASSE[l.status]}`}>{ROTULO_STATUS[l.status]}</span>
            </div>
            <p className="omni-apoio" style={{ margin: 0 }}>
              {l.escola}{l.tipo_instituicao ? ` · ${l.tipo_instituicao}` : ""}{l.faixa_estudantes ? ` · ${l.faixa_estudantes} estudantes` : ""}{l.cidade || l.uf ? ` · ${[l.cidade, l.uf].filter(Boolean).join("/")}` : ""}
            </p>
            <p className="omni-apoio" style={{ margin: 0, display: "flex", flexWrap: "wrap", gap: "4px 16px" }}>
              <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}><Mail aria-hidden width={16} height={16} /> <span style={{ userSelect: "all" }}>{l.email}</span></span>
              {l.telefone && <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}><Phone aria-hidden width={16} height={16} /> <span style={{ userSelect: "all" }}>{l.telefone}</span></span>}
              <span>{l.origem === "demonstracao" ? `Demonstração${l.papel_demo ? ` como ${l.papel_demo}` : ""}` : "Formulário de contato"} · {data(l.created_at)}</span>
            </p>
            {l.modulos_vistos && l.modulos_vistos.length > 0 && <p className="omni-apoio" style={{ margin: 0 }}>Abriu na demonstração: {l.modulos_vistos.join(", ")}</p>}
            {l.mensagem && <p style={{ margin: 0, font: "400 15px/22px var(--font-sans)", color: "var(--tinta)", whiteSpace: "pre-wrap" }}>{l.mensagem}</p>}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "flex-end" }}>
              <label className="omni-campo" style={{ minWidth: 180 }}>
                <span className="omni-campo__rotulo">Situação</span>
                <select className="omni-entrada" value={l.status} onChange={(e) => mudar(l.id, { status: e.target.value as StatusLead })}>
                  {STATUS_LEAD.map((s) => <option key={s} value={s}>{ROTULO_STATUS[s]}</option>)}
                </select>
              </label>
              <label className="omni-campo" style={{ flex: 1, minWidth: 220, maxWidth: "none" }}>
                <span className="omni-campo__rotulo">Anotações</span>
                <input className="omni-entrada" defaultValue={l.notas || ""} onBlur={(e) => { if (e.target.value !== (l.notas || "")) mudar(l.id, { notas: e.target.value }); }} placeholder="Ex.: ligar na quinta, pediu proposta para 3 escolas" />
              </label>
              {apagar === l.id ? (
                <span style={{ display: "inline-flex", gap: 8 }}>
                  <button type="button" className="omni-btn omni-btn--perigo omni-btn--pequeno" onClick={() => excluir(l.id)}>Apagar de vez</button>
                  <button type="button" className="omni-btn omni-btn--discreto omni-btn--pequeno" onClick={() => setApagar(null)}>Cancelar</button>
                </span>
              ) : (
                <button type="button" className="omni-btn omni-btn--discreto omni-btn--pequeno" onClick={() => setApagar(l.id)} aria-label={`Apagar o contato de ${l.nome}`}><Trash2 aria-hidden /> Apagar</button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
