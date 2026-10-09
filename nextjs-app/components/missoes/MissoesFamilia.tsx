"use client";

/**
 * Missões na conta da família (10/10/2026): o estudante faz a missão em casa, a família marca "consegui"
 * e a escola confirma. As conquistas confirmadas aparecem como círculos coloridos, nas cores do símbolo.
 */
import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import type { Missao } from "@/lib/missoes";

const CORES = ["vermelho", "amarelo", "laranja", "roxo", "azul", "verde"];
const dia = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("pt-BR") : "");

export function MissoesFamilia({ studentId, primeiro }: { studentId: string; primeiro: string }) {
  const [missoes, setMissoes] = useState<Missao[] | null>(null);
  const [indisponivel, setIndisponivel] = useState(false);
  const [feitosPasso, setFeitosPasso] = useState<Record<string, boolean>>({});
  const [abrindo, setAbrindo] = useState<string | null>(null);
  const [nota, setNota] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/familia/missoes?student_id=${studentId}`).then((r) => r.json())
      .then((d) => { setMissoes(d.missoes || []); setIndisponivel(Boolean(d.semMigracao)); })
      .catch(() => setIndisponivel(true));
  }, [studentId]);

  async function consegui(id: string) {
    setSalvando(true); setErro(null);
    try {
      const r = await fetch("/api/familia/missoes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ student_id: studentId, id, nota }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Erro");
      setMissoes((x) => (x || []).map((m) => (m.id === id ? d.missao : m)));
      setAbrindo(null); setNota("");
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não deu para marcar agora.");
    } finally { setSalvando(false); }
  }

  if (indisponivel || !missoes || missoes.length === 0) return null;
  const ativas = missoes.filter((m) => m.status === "aprovada");
  const esperando = missoes.filter((m) => m.status === "feita");
  const conquistas = missoes.filter((m) => m.status === "confirmada");

  return (
    <section aria-labelledby="f-missoes" style={{ display: "grid", gap: 12 }}>
      <div>
        <h2 id="f-missoes" style={{ margin: 0, font: "800 20px/26px var(--font-sans)", color: "var(--tinta)" }}>Missões de {primeiro}</h2>
        <p className="omni-apoio" style={{ margin: "4px 0 0", maxWidth: "65ch" }}>Desafios curtos que a escola preparou a partir do plano. Façam juntos, sem pressa; quando {primeiro} conseguir, marque aqui.</p>
      </div>
      {erro && <div className="omni-aviso omni-aviso--erro" role="alert"><div><div className="omni-aviso__texto">{erro}</div></div></div>}

      {ativas.length > 0 && (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3" style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {ativas.map((m, k) => (
            <li key={m.id} className="omni-cartao omni-cartao--plano" style={{ display: "grid", gap: 10, padding: 16, borderTop: `4px solid var(--encontro-${CORES[k % CORES.length]})` }}>
              <strong style={{ font: "800 18px/24px var(--font-sans)", color: "var(--tinta)" }}>{m.titulo}</strong>
              {m.passos.length > 0 && (
                <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 6 }}>
                  {m.passos.map((p, i) => {
                    const chave = `${m.id}-${i}`;
                    return (
                      <li key={chave}>
                        <label className="omni-caixa" style={{ fontSize: 16 }}>
                          <input type="checkbox" checked={!!feitosPasso[chave]} onChange={(e) => setFeitosPasso({ ...feitosPasso, [chave]: e.target.checked })} />
                          <span style={{ textDecoration: feitosPasso[chave] ? "line-through" : "none" }}>{p}</span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              )}
              {abrindo === m.id ? (
                <div style={{ display: "grid", gap: 8 }}>
                  <label className="omni-campo" style={{ maxWidth: "none" }}>
                    <span className="omni-campo__rotulo">Quer contar como foi? <span className="omni-campo__opcional">(opcional)</span></span>
                    <textarea className="omni-entrada" rows={2} maxLength={300} value={nota} onChange={(e) => setNota(e.target.value)} style={{ minHeight: 64 }} />
                  </label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button type="button" className="omni-btn omni-btn--primario omni-btn--pequeno" disabled={salvando} onClick={() => consegui(m.id)}>{salvando ? "Enviando…" : "Enviar para a escola"}</button>
                    <button type="button" className="omni-btn omni-btn--discreto omni-btn--pequeno" onClick={() => { setAbrindo(null); setNota(""); }}>Voltar</button>
                  </div>
                </div>
              ) : (
                <button type="button" className="omni-btn omni-btn--primario" style={{ justifySelf: "start" }} onClick={() => setAbrindo(m.id)}>{primeiro} conseguiu!</button>
              )}
            </li>
          ))}
        </ul>
      )}

      {esperando.length > 0 && (
        <p className="omni-apoio" style={{ margin: 0 }}>
          Esperando a escola confirmar: {esperando.map((m) => m.titulo).join("; ")}.
        </p>
      )}

      {conquistas.length > 0 && (
        <div style={{ display: "grid", gap: 8 }}>
          <h3 style={{ margin: 0, font: "700 16px/22px var(--font-sans)", color: "var(--tinta)" }}>Conquistas ({conquistas.length})</h3>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexWrap: "wrap", gap: 12 }}>
            {conquistas.map((m, k) => (
              <li key={m.id} title={`Confirmada em ${dia(m.confirmada_em)}`} style={{ display: "grid", justifyItems: "center", gap: 6, width: 120, textAlign: "center" }}>
                <span aria-hidden style={{ width: 56, height: 56, borderRadius: "50%", display: "grid", placeItems: "center", background: `var(--encontro-${CORES[k % CORES.length]})`, color: "#fff" }}><Check strokeWidth={3} /></span>
                <span style={{ font: "600 13px/17px var(--font-sans)", color: "var(--tinta)" }}>{m.titulo}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
