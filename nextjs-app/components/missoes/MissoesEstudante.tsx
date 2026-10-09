"use client";

/**
 * Missões do estudante na ficha (10/10/2026, onda 6 do mapa da plataforma).
 * A escola cria (com sugestões da IA tiradas das metas do PEI) e aprova; a família vê e marca "consegui";
 * a escola confirma e a missão vira conquista.
 */
import { useCallback, useEffect, useState } from "react";
import { Sparkles, Plus } from "lucide-react";
import SimboloOmnisfera from "@/components/SimboloOmnisfera";
import type { Missao } from "@/lib/missoes";
import { EditorMissao, type Rascunho } from "./EditorMissao";

const dia = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("pt-BR") : "");
const VAZIA: Rascunho = { titulo: "", passos: [""], meta: "", onde: "casa" };

export function MissoesEstudante({ studentId, nome, familia }: { studentId: string; nome: string; familia: boolean }) {
  const [missoes, setMissoes] = useState<Missao[] | null>(null);
  const [semMigracao, setSemMigracao] = useState(false);
  const [rascunhos, setRascunhos] = useState<Array<Rascunho & { chave: string }>>([]);
  const [sugerindo, setSugerindo] = useState(false);
  const [salvando, setSalvando] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const primeiro = nome.split(" ")[0];
  const url = `/api/students/${studentId}/missoes`;

  const carregar = useCallback(async () => {
    try {
      const r = await fetch(url);
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Erro");
      setMissoes(d.missoes || []);
      setSemMigracao(Boolean(d.semMigracao));
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não deu para carregar as missões.");
    }
  }, [url]);
  useEffect(() => { carregar(); }, [carregar]);

  async function sugerir() {
    setSugerindo(true); setErro(null);
    try {
      const r = await fetch(`${url}/sugerir`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ quantas: 3 }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Erro");
      setRascunhos((x) => [...x, ...d.sugestoes.map((s: Rascunho, i: number) => ({ ...s, chave: `${Date.now()}-${i}` }))]);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não deu para sugerir agora.");
    } finally { setSugerindo(false); }
  }

  async function aprovar(chave: string, m: Rascunho) {
    setSalvando(chave); setErro(null);
    try {
      const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(m) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Erro");
      setMissoes((x) => [d.missao, ...(x || [])]);
      setRascunhos((x) => x.filter((y) => y.chave !== chave));
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não deu para salvar.");
    } finally { setSalvando(null); }
  }

  async function agir(id: string, acao: "confirmar" | "reabrir" | "arquivar") {
    setSalvando(id); setErro(null);
    try {
      const r = await fetch(url, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, acao }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Erro");
      setMissoes((x) => (x || []).map((m) => (m.id === id ? d.missao : m)));
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não deu para mudar a missão.");
    } finally { setSalvando(null); }
  }

  const feitas = (missoes || []).filter((m) => m.status === "feita");
  const ativas = (missoes || []).filter((m) => m.status === "aprovada");
  const conquistas = (missoes || []).filter((m) => m.status === "confirmada");

  const Cartao = ({ m, children }: { m: Missao; children?: React.ReactNode }) => (
    <li className="omni-cartao omni-cartao--plano" style={{ display: "grid", gap: 6, padding: "12px 16px" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 10px", alignItems: "baseline" }}>
        <strong style={{ font: "700 16px/22px var(--font-sans)", color: "var(--tinta)" }}>{m.titulo}</strong>
        <span className="omni-apoio" style={{ fontSize: 13 }}>{m.onde}{m.meta ? ` · treina: ${m.meta}` : ""}</span>
      </div>
      {m.passos.length > 0 && (
        <ol style={{ margin: 0, paddingLeft: 20, listStyle: "decimal", font: "400 14px/21px var(--font-sans)", color: "var(--tinta-2)" }}>
          {m.passos.map((p, i) => <li key={i}>{p}</li>)}
        </ol>
      )}
      {children}
    </li>
  );

  return (
    <section id="missoes" aria-labelledby="ficha-missoes" style={{ display: "grid", gap: 16, scrollMarginTop: 80 }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h2 id="ficha-missoes" style={{ margin: 0, font: "800 20px/26px var(--font-sans)", color: "var(--tinta)" }}>Missões</h2>
          <p className="omni-apoio" style={{ margin: "4px 0 0", maxWidth: "65ch" }}>
            Desafios curtos que saem das metas do PEI. {familia ? `${primeiro} vê pela conta da família, marca o que conseguiu, e a escola confirma.` : "Ligue o módulo Família em Configuração para que o estudante veja as missões em casa."}
          </p>
        </div>
        {!semMigracao && missoes && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <button type="button" className="omni-btn omni-btn--secundario omni-btn--pequeno" onClick={sugerir} disabled={sugerindo}>
              {sugerindo ? <><SimboloOmnisfera tamanho={18} animacao="gerando" mono="currentColor" /> Sugerindo…</> : <><Sparkles aria-hidden /> Sugerir com IA</>}
            </button>
            <button type="button" className="omni-btn omni-btn--discreto omni-btn--pequeno" onClick={() => setRascunhos((x) => [...x, { ...VAZIA, chave: String(Date.now()) }])}>
              <Plus aria-hidden /> Criar uma missão
            </button>
          </div>
        )}
      </div>

      {semMigracao && <div className="omni-aviso omni-aviso--atencao"><div><div className="omni-aviso__texto">As missões ficam disponíveis depois que a atualização do banco for aplicada.</div></div></div>}
      {erro && <div className="omni-aviso omni-aviso--erro" role="alert"><div><div className="omni-aviso__texto">{erro}</div></div></div>}
      {!missoes && !erro && <p className="omni-apoio" role="status">Carregando…</p>}

      {rascunhos.length > 0 && (
        <div style={{ display: "grid", gap: 10 }}>
          <p className="omni-apoio" style={{ margin: 0 }}>Revise antes de aprovar: só missões aprovadas aparecem para {primeiro}.</p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {rascunhos.map((r) => (
              <EditorMissao key={r.chave} inicial={r} salvando={salvando === r.chave}
                onAprovar={(m) => aprovar(r.chave, m)} onDescartar={() => setRascunhos((x) => x.filter((y) => y.chave !== r.chave))} />
            ))}
          </div>
        </div>
      )}

      {feitas.length > 0 && (
        <div style={{ display: "grid", gap: 8 }}>
          <h3 style={{ margin: 0, font: "700 16px/22px var(--font-sans)", color: "var(--tinta)" }}>Para confirmar <span className="omni-estado omni-estado--info">{feitas.length}</span></h3>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 10 }}>
            {feitas.map((m) => (
              <Cartao key={m.id} m={m}>
                <p style={{ margin: 0, font: "500 14px/21px var(--font-sans)", color: "var(--tinta)" }}>
                  A família marcou como feita em {dia(m.feita_em)}{m.nota_familia ? `: "${m.nota_familia}"` : "."}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  <button type="button" className="omni-btn omni-btn--primario omni-btn--pequeno" disabled={salvando === m.id} onClick={() => agir(m.id, "confirmar")}>Confirmar a conquista</button>
                  <button type="button" className="omni-btn omni-btn--discreto omni-btn--pequeno" disabled={salvando === m.id} onClick={() => agir(m.id, "reabrir")}>Pedir para tentar de novo</button>
                </div>
              </Cartao>
            ))}
          </ul>
        </div>
      )}

      {missoes && (
        <div style={{ display: "grid", gap: 8 }}>
          <h3 style={{ margin: 0, font: "700 16px/22px var(--font-sans)", color: "var(--tinta)" }}>Em andamento</h3>
          {ativas.length === 0 ? (
            <p className="omni-apoio" style={{ margin: 0 }}>Nenhuma missão ativa. Comece pelo "Sugerir com IA": as sugestões saem das metas do PEI.</p>
          ) : (
            <ul className="grid grid-cols-1 lg:grid-cols-2 gap-3" style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {ativas.map((m) => (
                <Cartao key={m.id} m={m}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    <button type="button" className="omni-btn omni-btn--discreto omni-btn--pequeno" disabled={salvando === m.id} onClick={() => agir(m.id, "confirmar")}>Conseguiu na escola</button>
                    <button type="button" className="omni-btn omni-btn--discreto omni-btn--pequeno" disabled={salvando === m.id} onClick={() => agir(m.id, "arquivar")}>Arquivar</button>
                  </div>
                </Cartao>
              ))}
            </ul>
          )}
        </div>
      )}

      {conquistas.length > 0 && (
        <details>
          <summary style={{ cursor: "pointer", font: "700 16px/22px var(--font-sans)", color: "var(--tinta)" }}>Conquistas de {primeiro} ({conquistas.length})</summary>
          <ul style={{ margin: "8px 0 0", paddingLeft: 18, display: "grid", gap: 4, font: "400 15px/22px var(--font-sans)", color: "var(--tinta-2)" }}>
            {conquistas.map((m) => <li key={m.id}><strong>{m.titulo}</strong> · confirmada em {dia(m.confirmada_em)}</li>)}
          </ul>
        </details>
      )}
    </section>
  );
}
