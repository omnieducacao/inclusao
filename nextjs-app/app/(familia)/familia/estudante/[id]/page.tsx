"use client";

/**
 * Área da família, por estudante (10/10/2026, onda Família): no design system, com a conversa com a
 * escola e com o que a família envia chegando à coordenação. A ciência vale para a versão vigente do PEI.
 */
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Send, Check } from "lucide-react";
import { Soltar, LinhaEscolha, Pilula } from "@/components/ferramenta/Mesa";
import { ESCALA_OMNISFERA, type NivelOmnisfera } from "@/lib/omnisfera-types";
import { MissoesFamilia } from "@/components/missoes/MissoesFamilia";

type EstudanteData = {
  estudante: { id: string; name: string; grade: string | null; class_group: string | null };
  pei_resumo: { resumo?: string | null; resumo_liberado_em?: string | null; versao?: number | null } | null;
  paee_resumo: { periodo?: string | null; foco?: string } | null;
  evolucao: { evolucao: Array<{ disciplina: string; periodos: number; media_mais_recente: number | null }> };
  ciencia_pei: { acknowledged: boolean; acknowledged_at: string | null };
};
type Laudo = { id: string; transcricao: string; nome_arquivo: string | null; created_at: string };
type Medicacao = { id: string; medicamento: string; dosagem: string | null; tipo_alteracao: string; observacao: string | null; created_at: string };
type Mensagem = { id: string; autor: "escola" | "familia"; autor_nome: string | null; texto: string; lida_em: string | null; created_at: string };

const TIPOS_MED = [
  { id: "inicio", nome: "Começou a tomar" },
  { id: "mudanca_dose", nome: "Mudou a dose" },
  { id: "suspensao", nome: "Parou de tomar" },
];
const nomeTipo = (t: string) => TIPOS_MED.find((x) => x.id === t)?.nome || t;
// data sem hora ("2026-10-09") não passa por fuso, senão vira o dia anterior
const dia = (iso: string) => /^\d{4}-\d{2}-\d{2}$/.test(iso) ? iso.split("-").reverse().join("/") : new Date(iso).toLocaleDateString("pt-BR");
/** "2026-01-28 a 2026-04-22" → " de 28/01 a 22/04" */
const periodoBr = (p?: string | null) => {
  const d = (p || "").match(/\d{4}-\d{2}-\d{2}/g);
  return d && d.length === 2 ? ` de ${d[0].slice(8, 10)}/${d[0].slice(5, 7)} a ${d[1].slice(8, 10)}/${d[1].slice(5, 7)}` : "";
};
const quando = (iso: string) => new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

function Aviso({ tom, children }: { tom: "erro" | "sucesso" | "info" | "atencao"; children: React.ReactNode }) {
  return <div className={`omni-aviso omni-aviso--${tom}`} role={tom === "erro" ? "alert" : "status"}><div><div className="omni-aviso__texto">{children}</div></div></div>;
}

export default function FamiliaEstudantePage({ params }: { params: Promise<{ id: string }> }) {
  const [studentId, setStudentId] = useState<string | null>(null);
  const [data, setData] = useState<EstudanteData | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [laudos, setLaudos] = useState<Laudo[]>([]);
  const [meds, setMeds] = useState<Medicacao[]>([]);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [semMensagens, setSemMensagens] = useState(false);

  const [leu, setLeu] = useState(false);
  const [cienciaSalvando, setCienciaSalvando] = useState(false);
  const [texto, setTexto] = useState("");
  const [enviandoMsg, setEnviandoMsg] = useState(false);
  const [laudoEnviando, setLaudoEnviando] = useState(false);
  const [medForm, setMedForm] = useState({ medicamento: "", dosagem: "", tipo_alteracao: "inicio", observacao: "" });
  const [medSalvando, setMedSalvando] = useState(false);
  const [aviso, setAviso] = useState<{ tom: "erro" | "sucesso"; texto: string } | null>(null);
  const fimRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => { params.then((p) => setStudentId(p.id)); }, [params]);

  const carregar = useCallback(async (id: string) => {
    try {
      const r = await fetch(`/api/familia/estudante/${id}`);
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Erro");
      setData(d);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não deu para carregar agora.");
    }
    fetch(`/api/familia/laudos?student_id=${id}`).then((r) => r.json()).then((d) => setLaudos(d.laudos || [])).catch(() => {});
    fetch(`/api/familia/medicacao?student_id=${id}`).then((r) => r.json()).then((d) => setMeds(d.registros || [])).catch(() => {});
    fetch(`/api/familia/mensagens?student_id=${id}`).then((r) => r.json()).then((d) => { setMensagens(d.mensagens || []); setSemMensagens(Boolean(d.semMigracao)); }).catch(() => setSemMensagens(true));
  }, []);
  useEffect(() => { if (studentId) carregar(studentId); }, [studentId, carregar]);

  if (erro) {
    return (
      <div style={{ display: "grid", gap: 12, maxWidth: 560 }}>
        <Aviso tom="erro">{erro} Confira se o estudante está ligado à sua conta.</Aviso>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" className="omni-btn omni-btn--primario" onClick={() => { setErro(null); if (studentId) carregar(studentId); }}>Tentar de novo</button>
          <Link href="/familia" className="omni-btn omni-btn--secundario">Voltar</Link>
        </div>
      </div>
    );
  }
  if (!data) return <p className="omni-apoio" role="status">Carregando…</p>;

  const { estudante, pei_resumo, paee_resumo, evolucao, ciencia_pei } = data;
  const primeiro = estudante.name.split(" ")[0];

  async function registrarCiencia() {
    if (!studentId) return;
    setCienciaSalvando(true);
    try {
      const r = await fetch("/api/familia/ciencia-pei", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ student_id: studentId }) });
      const d = await r.json();
      if (!r.ok || !d.acknowledged) throw new Error(d.error || "Erro");
      setData((p) => p ? { ...p, ciencia_pei: { acknowledged: true, acknowledged_at: new Date().toISOString() } } : p);
    } catch {
      setAviso({ tom: "erro", texto: "Não deu para registrar a ciência agora. Tente de novo." });
    } finally {
      setCienciaSalvando(false);
    }
  }

  async function enviarMensagem() {
    if (!texto.trim() || !studentId) return;
    setEnviandoMsg(true);
    try {
      const r = await fetch("/api/familia/mensagens", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ student_id: studentId, texto }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Erro");
      setMensagens((m) => [...m, d.mensagem]);
      setTexto("");
      setTimeout(() => fimRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" }), 50);
    } catch (e) {
      setAviso({ tom: "erro", texto: e instanceof Error ? e.message : "Não deu para enviar agora." });
    } finally {
      setEnviandoMsg(false);
    }
  }

  async function enviarLaudo(f: File) {
    if (!studentId) return;
    setLaudoEnviando(true);
    setAviso(null);
    try {
      const fd = new FormData();
      fd.append("file", f);
      fd.append("student_id", studentId);
      const r = await fetch("/api/familia/laudos", { method: "POST", body: fd });
      const d = await r.json();
      if (!r.ok || !d.laudo) throw new Error(d.error || "Erro");
      setLaudos((l) => [d.laudo, ...l]);
      setAviso({ tom: "sucesso", texto: "Laudo enviado. A escola recebe um aviso." });
    } catch (e) {
      setAviso({ tom: "erro", texto: e instanceof Error ? e.message : "Não deu para enviar o laudo." });
    } finally {
      setLaudoEnviando(false);
    }
  }

  async function salvarMedicacao() {
    if (!studentId || !medForm.medicamento.trim()) return;
    setMedSalvando(true);
    setAviso(null);
    try {
      const r = await fetch("/api/familia/medicacao", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ student_id: studentId, ...medForm }) });
      const d = await r.json();
      if (!r.ok || !d.registro) throw new Error(d.error || "Erro");
      setMeds((m) => [d.registro, ...m]);
      setMedForm({ medicamento: "", dosagem: "", tipo_alteracao: "inicio", observacao: "" });
      setAviso({ tom: "sucesso", texto: "Aviso de medicação enviado. A escola recebe um aviso." });
    } catch (e) {
      setAviso({ tom: "erro", texto: e instanceof Error ? e.message : "Não deu para enviar agora." });
    } finally {
      setMedSalvando(false);
    }
  }

  const h2 = { margin: 0, font: "800 20px/26px var(--font-sans)", color: "var(--tinta)" } as const;
  const enviados = [
    ...laudos.map((l) => ({ id: l.id, quando: l.created_at, titulo: `Laudo${l.nome_arquivo ? ` · ${l.nome_arquivo}` : ""}`, detalhe: "" })),
    ...meds.map((m) => ({ id: m.id, quando: m.created_at, titulo: `Medicação: ${m.medicamento}`, detalhe: [nomeTipo(m.tipo_alteracao), m.dosagem, m.observacao].filter(Boolean).join(" · ") })),
  ].sort((a, b) => (a.quando < b.quando ? 1 : -1));

  return (
    <div style={{ display: "grid", gap: 28, maxWidth: 1040 }}>
      <Link href="/familia" className="omni-btn omni-btn--discreto omni-btn--pequeno" style={{ justifySelf: "start" }}>
        <ArrowLeft aria-hidden /> Meus estudantes
      </Link>

      <header style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <span className="omni-avatar" aria-hidden style={{ width: 56, height: 56, fontSize: 20 }}>{estudante.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()}</span>
        <div>
          <h1 style={{ margin: 0, font: "800 28px/34px var(--font-sans)", color: "var(--tinta)" }}>{estudante.name}</h1>
          <p className="omni-apoio" style={{ margin: 0 }}>{[estudante.grade, estudante.class_group && `Turma ${estudante.class_group}`].filter(Boolean).join(" · ") || "—"}</p>
        </div>
      </header>

      {aviso && <Aviso tom={aviso.tom}>{aviso.texto}</Aviso>}

      <section aria-labelledby="f-plano" className="omni-cartao omni-cartao--plano" style={{ display: "grid", gap: 12 }}>
        <h2 id="f-plano" style={h2}>O plano de {primeiro}</h2>
        {pei_resumo?.resumo ? (
          <>
            <p className="omni-apoio" style={{ margin: 0 }}>
              É o PEI (Plano Educacional Individualizado), resumido pela escola para a família{pei_resumo.versao ? ` · versão ${pei_resumo.versao}` : ""}{pei_resumo.resumo_liberado_em ? ` · liberado em ${dia(pei_resumo.resumo_liberado_em)}` : ""}.
            </p>
            <div style={{ whiteSpace: "pre-wrap", maxHeight: 480, overflowY: "auto", padding: 16, borderRadius: 12, background: "var(--superficie)", border: "1px solid var(--borda)", font: "400 16px/26px var(--font-sans)", color: "var(--tinta)" }}>
              {pei_resumo.resumo}
            </div>
            {ciencia_pei.acknowledged ? (
              <p style={{ margin: 0, display: "flex", alignItems: "center", gap: 8, font: "600 15px/22px var(--font-sans)", color: "var(--sucesso)" }}>
                <Check aria-hidden /> Você registrou que leu este plano{ciencia_pei.acknowledged_at ? ` em ${dia(ciencia_pei.acknowledged_at)}` : ""}.
              </p>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                <label className="omni-caixa">
                  <input type="checkbox" checked={leu} onChange={(e) => setLeu(e.target.checked)} />
                  <span>Li o plano de {primeiro} e estou ciente do que a escola vai fazer.</span>
                </label>
                <p className="omni-apoio" style={{ margin: 0, fontSize: 14 }}>
                  A escola guarda a data da sua ciência. A LBI (Lei Brasileira de Inclusão) prevê que a família participe do plano. Ficou alguma dúvida? Escreva para a escola logo abaixo.
                </p>
                <button type="button" className="omni-btn omni-btn--primario" style={{ justifySelf: "start" }} disabled={!leu || cienciaSalvando} onClick={registrarCiencia}>
                  {cienciaSalvando ? "Registrando…" : "Registrar minha ciência"}
                </button>
              </div>
            )}
          </>
        ) : (
          <p className="omni-apoio" style={{ margin: 0 }}>A escola está preparando um resumo do plano de {primeiro} para você. Ele aparece aqui assim que for liberado.</p>
        )}
      </section>

      <section aria-labelledby="f-evolucao" style={{ display: "grid", gap: 12 }}>
        <h2 id="f-evolucao" style={h2}>Como {primeiro} está indo</h2>
        {evolucao?.evolucao?.length ? (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3" style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {evolucao.evolucao.map((e) => {
              const nivel = e.media_mais_recente == null ? null : (Math.max(0, Math.min(4, Math.round(e.media_mais_recente))) as NivelOmnisfera);
              return (
                <li key={e.disciplina} className="omni-cartao omni-cartao--plano" style={{ display: "grid", gap: 4, padding: "12px 16px" }}>
                  <strong style={{ font: "700 16px/22px var(--font-sans)", color: "var(--tinta)" }}>{e.disciplina}</strong>
                  {nivel == null ? <span className="omni-apoio">Ainda sem registro.</span> : (
                    <span style={{ font: "400 15px/22px var(--font-sans)", color: "var(--tinta-2)" }}>
                      <strong>{ESCALA_OMNISFERA[nivel].label}</strong> · nível {nivel} de 4. {ESCALA_OMNISFERA[nivel].descricao}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="omni-apoio" style={{ margin: 0 }}>Os professores ainda não registraram avaliações neste ano.</p>
        )}
        {paee_resumo && (
          <p className="omni-apoio" style={{ margin: 0 }}>
            {/* O foco do ciclo é texto da equipe (às vezes com diagnóstico e CID): a família vê só que há atendimento e o período */}
            {primeiro} está no atendimento especializado (AEE, Atendimento Educacional Especializado){periodoBr(paee_resumo.periodo)}.
          </p>
        )}
      </section>

      {studentId && <MissoesFamilia studentId={studentId} primeiro={primeiro} />}

      <section aria-labelledby="f-conversa" className="omni-cartao omni-cartao--plano" style={{ display: "grid", gap: 12 }}>
        <h2 id="f-conversa" style={h2}>Conversa com a escola</h2>
        {semMensagens ? (
          <p className="omni-apoio" style={{ margin: 0 }}>As mensagens com a escola ainda não estão ligadas.</p>
        ) : (
          <>
            <div style={{ display: "grid", gap: 8, maxHeight: 380, overflowY: "auto" }} aria-live="polite">
              {mensagens.length === 0 && <p className="omni-apoio" style={{ margin: 0 }}>Nenhuma mensagem ainda. Use para recados curtos; assuntos maiores, combine uma conversa com a escola.</p>}
              {mensagens.map((m) => {
                const minha = m.autor === "familia";
                return (
                  <div key={m.id} style={{ justifySelf: minha ? "end" : "start", maxWidth: "85%", padding: "8px 12px", borderRadius: minha ? "14px 14px 4px 14px" : "14px 14px 14px 4px", background: minha ? "var(--acao-suave)" : "var(--superficie)", border: "1px solid var(--borda)" }}>
                    <p style={{ margin: 0, whiteSpace: "pre-wrap", font: "400 15px/22px var(--font-sans)", color: "var(--tinta)" }}>{m.texto}</p>
                    <p style={{ margin: "2px 0 0", font: "500 12px/16px var(--font-sans)", color: "var(--tinta-3)" }}>{minha ? "Você" : m.autor_nome || "Escola"} · {quando(m.created_at)}{minha && m.lida_em ? " · lida pela escola" : ""}</p>
                  </div>
                );
              })}
              <div ref={fimRef} />
            </div>
            <form onSubmit={(e) => { e.preventDefault(); enviarMensagem(); }} style={{ display: "grid", gap: 8 }}>
              <label className="omni-campo" style={{ maxWidth: "none" }}>
                <span className="omni-so-leitor">Mensagem para a escola</span>
                <textarea className="omni-entrada" rows={2} maxLength={1000} value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Escreva para a escola" style={{ minHeight: 72 }} />
              </label>
              <button type="submit" className="omni-btn omni-btn--primario omni-btn--pequeno" style={{ justifySelf: "end" }} disabled={enviandoMsg || !texto.trim()}>
                <Send aria-hidden /> {enviandoMsg ? "Enviando…" : "Enviar"}
              </button>
            </form>
          </>
        )}
      </section>

      <section aria-labelledby="f-enviar" style={{ display: "grid", gap: 12 }}>
        <div>
          <h2 id="f-enviar" style={h2}>Enviar para a escola</h2>
          <p className="omni-apoio" style={{ margin: "4px 0 0", maxWidth: "65ch" }}>A coordenação recebe um aviso. O laudo ajuda a escola a entender {primeiro}; ele não é condição para nenhum apoio.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" style={{ alignItems: "start" }}>
          <div className="omni-cartao omni-cartao--plano" style={{ display: "grid", gap: 10 }}>
            <h3 style={{ margin: 0, font: "700 16px/22px var(--font-sans)", color: "var(--tinta)" }}>Laudo ou relatório</h3>
            <Soltar aceita=".pdf,.jpg,.jpeg,.png,.webp" texto={laudoEnviando ? "Lendo o documento…" : "Arraste o PDF ou a foto, ou clique para escolher"} dica="O texto é lido e guardado com segurança." onArquivos={(l) => l[0] && !laudoEnviando && enviarLaudo(l[0])} />
          </div>
          <form className="omni-cartao omni-cartao--plano" style={{ display: "grid", gap: 10 }} onSubmit={(e) => { e.preventDefault(); salvarMedicacao(); }}>
            <h3 style={{ margin: 0, font: "700 16px/22px var(--font-sans)", color: "var(--tinta)" }}>Mudança de medicação</h3>
            <LinhaEscolha rotulo="O que mudou" valor={medForm.tipo_alteracao}>
              {TIPOS_MED.map((t) => <Pilula key={t.id} on={medForm.tipo_alteracao === t.id} onClick={() => setMedForm({ ...medForm, tipo_alteracao: t.id })}>{t.nome}</Pilula>)}
            </LinhaEscolha>
            <label className="omni-campo" style={{ maxWidth: "none" }}>
              <span className="omni-campo__rotulo">Remédio</span>
              <input className="omni-entrada" value={medForm.medicamento} onChange={(e) => setMedForm({ ...medForm, medicamento: e.target.value })} required />
            </label>
            <label className="omni-campo" style={{ maxWidth: "none" }}>
              <span className="omni-campo__rotulo">Dose e horário <span className="omni-campo__opcional">(opcional)</span></span>
              <input className="omni-entrada" value={medForm.dosagem} onChange={(e) => setMedForm({ ...medForm, dosagem: e.target.value })} placeholder="Ex.: 10 mg pela manhã" />
            </label>
            <label className="omni-campo" style={{ maxWidth: "none" }}>
              <span className="omni-campo__rotulo">O que a escola deve saber <span className="omni-campo__opcional">(opcional)</span></span>
              <textarea className="omni-entrada" rows={2} value={medForm.observacao} onChange={(e) => setMedForm({ ...medForm, observacao: e.target.value })} style={{ minHeight: 64 }} />
            </label>
            <button type="submit" className="omni-btn omni-btn--primario" style={{ justifySelf: "start" }} disabled={medSalvando || !medForm.medicamento.trim()}>
              {medSalvando ? "Enviando…" : "Avisar a escola"}
            </button>
          </form>
        </div>
        {enviados.length > 0 && (
          <details>
            <summary className="omni-apoio" style={{ cursor: "pointer" }}>O que você já enviou ({enviados.length})</summary>
            <ul style={{ margin: "8px 0 0", paddingLeft: 18, display: "grid", gap: 4, font: "400 15px/22px var(--font-sans)", color: "var(--tinta-2)" }}>
              {enviados.map((x) => <li key={x.id}><strong>{x.titulo}</strong> · {dia(x.quando)}{x.detalhe ? ` · ${x.detalhe}` : ""}</li>)}
            </ul>
          </details>
        )}
      </section>
    </div>
  );
}
