"use client";

/**
 * Família na ficha do estudante (10/10/2026): o que a família enviou (laudo, mudança de medicação)
 * e a conversa com ela. Antes, o que a família mandava não aparecia em nenhuma tela da escola.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import type { ItemFamilia, Mensagem } from "@/lib/familia-caixa";

type Dados = { itens: ItemFamilia[]; mensagens: Mensagem[]; responsaveis: Array<{ nome: string; parentesco: string | null; ativo: boolean }>; semMigracao?: boolean };

const quando = (iso: string) => new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
const ALTERACAO: Record<string, string> = { inicio: "Começou a tomar", mudanca_dose: "Mudou a dose", suspensao: "Parou de tomar" };

export function FichaFamilia({ studentId, nome }: { studentId: string; nome: string }) {
  const [dados, setDados] = useState<Dados | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [marcando, setMarcando] = useState(false);
  const fimRef = useRef<HTMLDivElement | null>(null);

  const carregar = useCallback(async () => {
    try {
      const r = await fetch(`/api/students/${studentId}/familia`);
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Erro");
      setDados(d);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não deu para carregar o que a família enviou.");
    }
  }, [studentId]);
  useEffect(() => { carregar(); }, [carregar]);

  async function enviar() {
    if (!texto.trim()) return;
    setEnviando(true);
    setErro(null);
    try {
      const r = await fetch(`/api/students/${studentId}/familia`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ texto }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Erro");
      setDados((x) => x ? { ...x, mensagens: [...x.mensagens, d.mensagem] } : x);
      setTexto("");
      setTimeout(() => fimRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" }), 50);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não deu para enviar agora.");
    } finally {
      setEnviando(false);
    }
  }

  async function marcarVisto() {
    setMarcando(true);
    try {
      const r = await fetch(`/api/students/${studentId}/familia`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ visto: true }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Erro");
      setDados((x) => x ? { ...x, itens: x.itens.map((i) => (i.visto_em ? i : { ...i, visto_em: d.visto_em })) } : x);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não deu para marcar agora.");
    } finally {
      setMarcando(false);
    }
  }

  const primeiro = nome.split(" ")[0];
  const novos = dados?.itens.filter((i) => !i.visto_em).length || 0;

  return (
    <section id="familia" aria-labelledby="ficha-familia" style={{ display: "grid", gap: 16, scrollMarginTop: 80 }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
        <h2 id="ficha-familia" style={{ margin: 0, font: "800 20px/26px var(--font-sans)", color: "var(--tinta)" }}>Família</h2>
        {dados && dados.responsaveis.length > 0 && (
          <p className="omni-apoio" style={{ margin: 0 }}>
            {dados.responsaveis.map((r) => [r.nome, r.parentesco && `(${r.parentesco})`].filter(Boolean).join(" ")).join(", ")}
          </p>
        )}
      </div>

      {dados?.semMigracao && (
        <div className="omni-aviso omni-aviso--atencao"><div><div className="omni-aviso__texto">A caixa da família e as mensagens ficam completas depois que a atualização do banco for aplicada. Até lá, dá para ver o que a família já enviou.</div></div></div>
      )}
      {erro && <div className="omni-aviso omni-aviso--erro" role="alert"><div><div className="omni-aviso__texto">{erro}</div></div></div>}
      {!dados && !erro && <p className="omni-apoio" role="status">Carregando…</p>}

      {dados && dados.responsaveis.length === 0 && (
        <p className="omni-apoio" style={{ margin: 0 }}>Nenhum responsável com acesso ainda. Cadastre em Dados do estudante, logo abaixo.</p>
      )}

      {dados && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" style={{ alignItems: "start" }}>
          <div className="omni-cartao omni-cartao--plano" style={{ display: "grid", gap: 12 }}>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
              <h3 style={{ margin: 0, font: "700 16px/22px var(--font-sans)", color: "var(--tinta)" }}>
                O que a família enviou {novos > 0 && <span className="omni-estado omni-estado--info" style={{ marginLeft: 6 }}>{novos} {novos === 1 ? "novo" : "novos"}</span>}
              </h3>
              {novos > 0 && (
                <button type="button" className="omni-btn omni-btn--discreto omni-btn--pequeno" onClick={marcarVisto} disabled={marcando}>
                  {marcando ? "Marcando…" : "Marcar como visto"}
                </button>
              )}
            </div>
            {dados.itens.length === 0 ? (
              <p className="omni-apoio" style={{ margin: 0 }}>Quando a família mandar um laudo ou avisar de uma mudança de medicação, aparece aqui.</p>
            ) : (
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 10 }}>
                {dados.itens.map((i) => (
                  <li key={i.id} style={{ padding: "10px 12px", borderRadius: 12, background: "var(--superficie)", border: `1px solid ${i.visto_em ? "var(--borda)" : "var(--acao)"}` }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 10px", alignItems: "baseline" }}>
                      <strong style={{ font: "700 15px/21px var(--font-sans)", color: "var(--tinta)" }}>
                        {i.tipo === "laudo" ? `Laudo${i.nome_arquivo ? ` · ${i.nome_arquivo}` : ""}` : `Medicação: ${i.medicamento}`}
                      </strong>
                      {!i.visto_em && <span className="omni-estado omni-estado--info">Novo</span>}
                      <span className="omni-apoio" style={{ fontSize: 13 }}>{quando(i.quando)}{i.quem ? ` · ${i.quem}` : ""}</span>
                    </div>
                    {i.tipo === "medicacao" ? (
                      <p style={{ margin: "4px 0 0", font: "400 14px/21px var(--font-sans)", color: "var(--tinta-2)" }}>
                        {[i.alteracao && (ALTERACAO[i.alteracao] || i.alteracao), i.dosagem, i.observacao].filter(Boolean).join(" · ") || "Sem detalhes."}
                      </p>
                    ) : (
                      <details style={{ marginTop: 4 }}>
                        <summary className="omni-apoio" style={{ cursor: "pointer" }}>Ler a transcrição</summary>
                        <p style={{ margin: "6px 0 0", whiteSpace: "pre-wrap", font: "400 14px/21px var(--font-sans)", color: "var(--tinta-2)" }}>{i.texto || "Sem texto."}</p>
                      </details>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="omni-cartao omni-cartao--plano" style={{ display: "grid", gap: 12 }}>
            <h3 style={{ margin: 0, font: "700 16px/22px var(--font-sans)", color: "var(--tinta)" }}>Conversa com a família</h3>
            <div style={{ display: "grid", gap: 8, maxHeight: 360, overflowY: "auto", paddingRight: 2 }} aria-live="polite">
              {dados.mensagens.length === 0 && <p className="omni-apoio" style={{ margin: 0 }}>Nenhuma mensagem ainda. Recados curtos, com registro; não substitui uma conversa em reunião.</p>}
              {dados.mensagens.map((m) => {
                const daEscola = m.autor === "escola";
                return (
                  <div key={m.id} style={{ justifySelf: daEscola ? "end" : "start", maxWidth: "85%", padding: "8px 12px", borderRadius: daEscola ? "14px 14px 4px 14px" : "14px 14px 14px 4px", background: daEscola ? "var(--acao-suave)" : "var(--superficie)", border: "1px solid var(--borda)" }}>
                    <p style={{ margin: 0, whiteSpace: "pre-wrap", font: "400 14px/21px var(--font-sans)", color: "var(--tinta)" }}>{m.texto}</p>
                    <p style={{ margin: "2px 0 0", font: "500 12px/16px var(--font-sans)", color: "var(--tinta-3)" }}>
                      {m.autor_nome || (daEscola ? "Escola" : "Família")} · {quando(m.created_at)}{daEscola && m.lida_em ? " · lida" : ""}
                    </p>
                  </div>
                );
              })}
              <div ref={fimRef} />
            </div>
            <form onSubmit={(e) => { e.preventDefault(); enviar(); }} style={{ display: "grid", gap: 8 }}>
              <label className="omni-campo" style={{ maxWidth: "none" }}>
                <span className="omni-so-leitor">Mensagem para a família de {primeiro}</span>
                <textarea className="omni-entrada" rows={2} maxLength={1000} value={texto} onChange={(e) => setTexto(e.target.value)} placeholder={`Recado para a família de ${primeiro}`} style={{ minHeight: 72 }} />
              </label>
              <button type="submit" className="omni-btn omni-btn--primario omni-btn--pequeno" style={{ justifySelf: "end" }} disabled={enviando || !texto.trim() || Boolean(dados.semMigracao)}>
                <Send aria-hidden /> {enviando ? "Enviando…" : "Enviar"}
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
