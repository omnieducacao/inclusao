"use client";

import { useState, useEffect, useRef } from "react";
import { Users, Plus, Link2, Unlink, Loader2, X, AlertTriangle } from "lucide-react";
import { useConfirmar } from "@/components/Confirmar";

/** Janela do design system (dialog nativo com showModal: prende o foco e fecha com Esc). */
function Janela({ id, titulo, aoFechar, children, acoes }: { id: string; titulo: string; aoFechar: () => void; children: React.ReactNode; acoes: React.ReactNode }) {
  const ref = useRef<HTMLDialogElement | null>(null);
  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) {
      try { d.showModal(); } catch { d.setAttribute("open", ""); }
    }
    return () => { try { d?.close(); } catch { /* já fechado */ } };
  }, []);
  return (
    <dialog
      ref={ref}
      className="omni-dialogo"
      aria-labelledby={`${id}-titulo`}
      onCancel={(e) => { e.preventDefault(); aoFechar(); }}
      onClick={(e) => { if (e.target === e.currentTarget) aoFechar(); }}
    >
      <div className="omni-dialogo__corpo">
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <h2 className="omni-dialogo__titulo" id={`${id}-titulo`}>{titulo}</h2>
          <button type="button" className="omni-btn omni-btn--discreto omni-btn--icone" onClick={aoFechar} aria-label="Fechar">
            <X aria-hidden />
          </button>
        </div>
        {children}
      </div>
      <div className="omni-dialogo__acoes">{acoes}</div>
    </dialog>
  );
}

function AvisoErro({ texto }: { texto: string }) {
  return (
    <div className="omni-aviso omni-aviso--erro" role="alert" style={{ maxWidth: "none" }}>
      <AlertTriangle className="omni-aviso__icone" aria-hidden />
      <div><div className="omni-aviso__texto" style={{ marginTop: 0 }}>{texto}</div></div>
    </div>
  );
}

type Responsavel = {
  id: string;
  nome: string;
  email: string;
  telefone?: string | null;
  parentesco?: string | null;
  vinculado?: boolean;
};

type Props = {
  studentId: string;
  studentName: string;
  onRefresh?: () => void;
};

export function ResponsaveisSection({ studentId, studentName, onRefresh }: Props) {
  const [responsaveis, setResponsaveis] = useState<Responsavel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const { confirmar, dialogo } = useConfirmar();
  const [form, setForm] = useState({
    nome: "",
    email: "",
    telefone: "",
    parentesco: "",
    senha: "",
  });

  useEffect(() => {
    let cancelled = false;
    async function fetchResponsaveis() {
      setLoading(true);
      try {
        const res = await fetch(`/api/familia/responsaveis?studentId=${studentId}`);
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setResponsaveis(data.responsaveis || []);
      } catch {
        if (!cancelled) setResponsaveis([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchResponsaveis();
    return () => { cancelled = true; };
  }, [studentId]);

  const linked = responsaveis.filter((r) => r.vinculado);
  const notLinked = responsaveis.filter((r) => !r.vinculado);

  async function handleCriar() {
    if (!form.nome.trim() || !form.email.trim() || !form.senha.trim()) {
      setErro("Nome, e-mail e senha são obrigatórios.");
      return;
    }
    setErro(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/familia/responsaveis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: form.nome.trim(),
          email: form.email.trim().toLowerCase(),
          telefone: form.telefone.trim() || undefined,
          parentesco: form.parentesco.trim() || undefined,
          senha: form.senha,
          studentIds: [studentId],
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErro(data.error || "Erro ao cadastrar responsável.");
        return;
      }
      setForm({ nome: "", email: "", telefone: "", parentesco: "", senha: "" });
      setShowModal(false);
      const refetch = await fetch(`/api/familia/responsaveis?studentId=${studentId}`);
      const refetchData = await refetch.json();
      setResponsaveis(refetchData.responsaveis || []);
      onRefresh?.();
    } catch (err) {
      setErro("Erro ao cadastrar. Tente novamente.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVincular(responsavelId: string) {
    setErro(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/familia/vincular", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          family_responsible_id: responsavelId,
          student_id: studentId,
          acao: "vincular",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErro(data.error || "Erro ao vincular.");
        return;
      }
      setShowLinkModal(false);
      const refetch = await fetch(`/api/familia/responsaveis?studentId=${studentId}`);
      const refetchData = await refetch.json();
      setResponsaveis(refetchData.responsaveis || []);
      onRefresh?.();
    } catch (err) {
      setErro("Erro ao vincular. Tente novamente.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDesvincular(responsavelId: string) {
    const responsavel = responsaveis.find((r) => r.id === responsavelId);
    const ok = await confirmar({
      titulo: `Desvincular ${responsavel?.nome ?? "este responsável"}?`,
      texto: `Essa pessoa deixa de ver ${studentName} na área Família. O cadastro dela continua, e você pode vincular de novo depois.`,
      acao: "Desvincular",
      cancelar: "Manter vínculo",
      perigo: true,
    });
    if (!ok) return;
    setErro(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/familia/vincular", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          family_responsible_id: responsavelId,
          student_id: studentId,
          acao: "desvincular",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErro(data.error || "Erro ao desvincular.");
        return;
      }
      const refetch = await fetch(`/api/familia/responsaveis?studentId=${studentId}`);
      const refetchData = await refetch.json();
      setResponsaveis(refetchData.responsaveis || []);
      onRefresh?.();
    } catch (err) {
      setErro("Erro ao desvincular. Tente novamente.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  const fecharNovo = () => { if (!submitting) { setShowModal(false); setErro(null); } };
  const fecharVincular = () => { if (!submitting) { setShowLinkModal(false); setErro(null); } };
  const algumaJanela = showModal || showLinkModal;

  return (
    <section className="omni-cartao" aria-labelledby={`responsaveis-${studentId}-t`}>
      {dialogo}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <h4 id={`responsaveis-${studentId}-t`} className="omni-cartao__titulo" style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
          <Users aria-hidden style={{ width: 18, height: 18, color: "var(--acao)" }} />
          Responsáveis da família
        </h4>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <button
            type="button"
            className="omni-btn omni-btn--secundario omni-btn--pequeno"
            onClick={() => { setErro(null); setShowLinkModal(true); }}
            disabled={notLinked.length === 0 || submitting}
          >
            <Link2 aria-hidden />
            Vincular quem já tem cadastro
          </button>
          <button
            type="button"
            className="omni-btn omni-btn--primario omni-btn--pequeno"
            onClick={() => { setErro(null); setShowModal(true); }}
          >
            <Plus aria-hidden />
            Adicionar responsável
          </button>
        </div>
      </div>

      {erro && !algumaJanela && <AvisoErro texto={erro} />}

      {loading ? (
        <p className="omni-apoio" role="status" style={{ display: "flex", alignItems: "center", gap: 8, margin: 0, padding: "12px 0" }}>
          <Loader2 aria-hidden className="animate-spin" style={{ width: 16, height: 16 }} />
          Carregando…
        </p>
      ) : linked.length === 0 ? (
        <p className="omni-apoio" style={{ margin: 0, padding: "12px 0" }}>
          Nenhum responsável vinculado a {studentName}. Adicione ou vincule alguém para que a família possa entrar na plataforma.
        </p>
      ) : (
        <div className="omni-tabela-caixa">
          <table className="omni-tabela">
            <caption className="omni-so-leitor">Responsáveis vinculados a {studentName}</caption>
            <thead>
              <tr>
                <th scope="col">Nome</th>
                <th scope="col">Contato</th>
                <th scope="col">Parentesco</th>
                <th scope="col" style={{ textAlign: "right" }}>Ação</th>
              </tr>
            </thead>
            <tbody>
              {linked.map((r) => (
                <tr key={r.id}>
                  <td className="omni-tabela__nome">{r.nome}</td>
                  <td style={{ color: "var(--tinta-2)" }}>{r.email}</td>
                  <td>
                    {r.parentesco ? (
                      <span className="omni-estado omni-estado--neutro">{r.parentesco}</span>
                    ) : (
                      <span style={{ color: "var(--tinta-3)" }}>—</span>
                    )}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      type="button"
                      className="omni-btn omni-btn--discreto omni-btn--pequeno"
                      style={{ color: "var(--erro)" }}
                      onClick={() => handleDesvincular(r.id)}
                      disabled={submitting}
                      aria-label={`Desvincular ${r.nome}`}
                    >
                      <Unlink aria-hidden />
                      Desvincular
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Janela: novo responsável */}
      {showModal && (
        <Janela
          id={`novo-resp-${studentId}`}
          titulo="Adicionar responsável"
          aoFechar={fecharNovo}
          acoes={
            <>
              <button type="button" className="omni-btn omni-btn--discreto" onClick={fecharNovo}>
                Cancelar
              </button>
              <button type="button" className="omni-btn omni-btn--primario" onClick={handleCriar} disabled={submitting} aria-busy={submitting}>
                {submitting && <Loader2 aria-hidden className="animate-spin" />}
                Cadastrar e vincular
              </button>
            </>
          }
        >
          <p className="omni-apoio" style={{ margin: 0 }}>
            A pessoa fica ligada a <strong>{studentName}</strong> e entra na área Família com e-mail e senha.
          </p>
          {erro && <AvisoErro texto={erro} />}
          <div style={{ display: "grid", gap: 12 }}>
            <label className="omni-campo" style={{ maxWidth: "none" }}>
              <span className="omni-campo__rotulo">Nome completo</span>
              <input
                className="omni-entrada"
                value={form.nome}
                onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                aria-required="true"
                autoComplete="off"
              />
            </label>
            <label className="omni-campo" style={{ maxWidth: "none" }}>
              <span className="omni-campo__rotulo">E-mail</span>
              <input
                className="omni-entrada"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="nome@exemplo.com"
                aria-required="true"
                autoComplete="off"
              />
            </label>
            <label className="omni-campo" style={{ maxWidth: "none" }}>
              <span className="omni-campo__rotulo">Telefone <span className="omni-campo__opcional">(opcional)</span></span>
              <input
                className="omni-entrada"
                type="tel"
                value={form.telefone}
                onChange={(e) => setForm((f) => ({ ...f, telefone: e.target.value }))}
                placeholder="(11) 99999-9999"
              />
            </label>
            <label className="omni-campo" style={{ maxWidth: "none" }}>
              <span className="omni-campo__rotulo">Parentesco <span className="omni-campo__opcional">(opcional)</span></span>
              <input
                className="omni-entrada"
                type="text"
                value={form.parentesco}
                onChange={(e) => setForm((f) => ({ ...f, parentesco: e.target.value }))}
                placeholder="Ex.: mãe, pai, avó, tutor"
              />
            </label>
            <label className="omni-campo" style={{ maxWidth: "none" }}>
              <span className="omni-campo__rotulo">Senha de acesso</span>
              <input
                className="omni-entrada"
                type="password"
                value={form.senha}
                onChange={(e) => setForm((f) => ({ ...f, senha: e.target.value }))}
                aria-required="true"
                autoComplete="new-password"
              />
              <span className="omni-campo__ajuda">Pelo menos 6 caracteres. Envie a senha ao responsável por um canal seguro.</span>
            </label>
          </div>
        </Janela>
      )}

      {/* Janela: vincular quem já tem cadastro */}
      {showLinkModal && (
        <Janela
          id={`vincular-resp-${studentId}`}
          titulo="Vincular responsável já cadastrado"
          aoFechar={fecharVincular}
          acoes={
            <button type="button" className="omni-btn omni-btn--secundario" onClick={fecharVincular}>
              Fechar
            </button>
          }
        >
          <p className="omni-apoio" style={{ margin: 0 }}>
            Escolha quem vai ficar ligado a <strong>{studentName}</strong>.
          </p>
          {erro && <AvisoErro texto={erro} />}
          {notLinked.length === 0 ? (
            <p className="omni-apoio" style={{ margin: 0 }}>Todos os responsáveis já estão vinculados a este estudante.</p>
          ) : (
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 8, maxHeight: 240, overflowY: "auto" }}>
              {notLinked.map((r) => (
                <li
                  key={r.id}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "10px 12px", background: "var(--superficie-2)", border: "1px solid var(--borda)", borderRadius: "var(--o-radius-md)" }}
                >
                  <div style={{ minWidth: 0 }}>
                    <span style={{ font: "700 15px/22px var(--font-sans)", color: "var(--tinta)" }}>{r.nome}</span>
                    <span style={{ display: "block", font: "400 13px/18px var(--font-sans)", color: "var(--tinta-2)", overflowWrap: "anywhere" }}>{r.email}</span>
                  </div>
                  <button
                    type="button"
                    className="omni-btn omni-btn--primario omni-btn--pequeno"
                    onClick={() => handleVincular(r.id)}
                    disabled={submitting}
                    aria-label={`Vincular ${r.nome}`}
                  >
                    Vincular
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Janela>
      )}
    </section>
  );
}
