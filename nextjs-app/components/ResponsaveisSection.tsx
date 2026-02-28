"use client";

import { useState, useEffect } from "react";
import { Users, Plus, Link2, Unlink, Loader2, X } from "lucide-react";

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
      alert("Nome, e-mail e senha são obrigatórios.");
      return;
    }
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
        alert(data.error || "Erro ao cadastrar responsável.");
        return;
      }
      setForm({ nome: "", email: "", telefone: "", parentesco: "", senha: "" });
      setShowModal(false);
      const refetch = await fetch(`/api/familia/responsaveis?studentId=${studentId}`);
      const refetchData = await refetch.json();
      setResponsaveis(refetchData.responsaveis || []);
      onRefresh?.();
    } catch (err) {
      alert("Erro ao cadastrar. Tente novamente.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVincular(responsavelId: string) {
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
        alert(data.error || "Erro ao vincular.");
        return;
      }
      setShowLinkModal(false);
      const refetch = await fetch(`/api/familia/responsaveis?studentId=${studentId}`);
      const refetchData = await refetch.json();
      setResponsaveis(refetchData.responsaveis || []);
      onRefresh?.();
    } catch (err) {
      alert("Erro ao vincular. Tente novamente.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDesvincular(responsavelId: string) {
    if (!confirm("Desvincular este responsável do estudante?")) return;
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
        alert(data.error || "Erro ao desvincular.");
        return;
      }
      const refetch = await fetch(`/api/familia/responsaveis?studentId=${studentId}`);
      const refetchData = await refetch.json();
      setResponsaveis(refetchData.responsaveis || []);
      onRefresh?.();
    } catch (err) {
      alert("Erro ao desvincular. Tente novamente.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
          <Users className="w-4 h-4 text-amber-600" />
          Responsáveis / Família
        </h4>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowLinkModal(true)}
            disabled={notLinked.length === 0 || submitting}
            className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200 disabled:opacity-50 flex items-center gap-1.5"
          >
            <Link2 className="w-3.5 h-3.5" />
            Vincular existente
          </button>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="px-3 py-1.5 text-xs font-medium text-amber-600 hover:bg-amber-50 rounded-lg border border-amber-200 flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Adicionar responsável
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-slate-500 py-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Carregando...
        </div>
      ) : linked.length === 0 ? (
        <p className="text-sm text-slate-500 italic py-2">
          Nenhum responsável vinculado a {studentName}. Adicione ou vincule um responsável para que a família possa acessar a plataforma.
        </p>
      ) : (
        <ul className="space-y-2">
          {linked.map((r) => (
            <li
              key={r.id}
              className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg border border-slate-100"
            >
              <div>
                <span className="font-medium text-slate-800">{r.nome}</span>
                <span className="text-slate-500 text-sm ml-2">({r.email})</span>
                {r.parentesco && (
                  <span className="ml-2 text-xs text-slate-500">— {r.parentesco}</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleDesvincular(r.id)}
                disabled={submitting}
                className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded disabled:opacity-50 flex items-center gap-1"
              >
                <Unlink className="w-3 h-3" />
                Desvincular
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Modal: Novo responsável */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => !submitting && setShowModal(false)}>
          <div
            className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Adicionar responsável</h3>
              <button
                type="button"
                onClick={() => !submitting && setShowModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              O responsável será vinculado a <strong>{studentName}</strong> e poderá acessar a área Família com e-mail e senha.
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Nome *</label>
                <input
                  type="text"
                  value={form.nome}
                  onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  placeholder="Nome completo"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">E-mail *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  placeholder="email@exemplo.com"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Telefone</label>
                <input
                  type="text"
                  value={form.telefone}
                  onChange={(e) => setForm((f) => ({ ...f, telefone: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Parentesco</label>
                <input
                  type="text"
                  value={form.parentesco}
                  onChange={(e) => setForm((f) => ({ ...f, parentesco: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  placeholder="Mãe, Pai, Avó, Tutor..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Senha de acesso *</label>
                <input
                  type="password"
                  value={form.senha}
                  onChange={(e) => setForm((f) => ({ ...f, senha: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  placeholder="Mín. 6 caracteres"
                />
                <p className="text-xs text-slate-500 mt-1">Envie a senha ao responsável por canal seguro.</p>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                type="button"
                onClick={handleCriar}
                disabled={submitting}
                className="px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 disabled:opacity-50 flex items-center gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Cadastrar e vincular
              </button>
              <button
                type="button"
                onClick={() => !submitting && setShowModal(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 text-sm"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Vincular existente */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => !submitting && setShowLinkModal(false)}>
          <div
            className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Vincular responsável existente</h3>
              <button
                type="button"
                onClick={() => !submitting && setShowLinkModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              Vincular a <strong>{studentName}</strong>:
            </p>
            {notLinked.length === 0 ? (
              <p className="text-sm text-slate-500 italic">Todos os responsáveis já estão vinculados a este estudante.</p>
            ) : (
              <ul className="space-y-2 max-h-60 overflow-y-auto">
                {notLinked.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg border border-slate-100"
                  >
                    <div>
                      <span className="font-medium text-slate-800">{r.nome}</span>
                      <span className="text-slate-500 text-sm ml-2">({r.email})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleVincular(r.id)}
                      disabled={submitting}
                      className="px-2 py-1 text-xs font-medium text-amber-600 hover:bg-amber-50 rounded disabled:opacity-50"
                    >
                      Vincular
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4">
              <button
                type="button"
                onClick={() => !submitting && setShowLinkModal(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 text-sm"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
