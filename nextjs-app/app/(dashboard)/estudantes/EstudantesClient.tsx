"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Student = {
  id: string;
  name: string;
  grade?: string | null;
  class_group?: string | null;
  diagnosis?: string | null;
  pei_data?: Record<string, unknown>;
  paee_ciclos?: unknown[];
};

type Props = {
  students: Student[];
};

export function EstudantesClient({ students: initialStudents }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [students, setStudents] = useState(initialStudents);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editGrade, setEditGrade] = useState("");
  const [editClassGroup, setEditClassGroup] = useState("");
  const [editDiagnosis, setEditDiagnosis] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return students;
    const q = search.trim().toLowerCase();
    return students.filter(
      (s) =>
        (s.name || "").toLowerCase().includes(q) ||
        (s.grade || "").toLowerCase().includes(q) ||
        (s.class_group || "").toLowerCase().includes(q) ||
        (s.diagnosis || "").toLowerCase().includes(q)
    );
  }, [students, search]);

  const startEdit = (student: Student) => {
    setEditingId(student.id);
    setEditName(student.name || "");
    setEditGrade(student.grade || "");
    setEditClassGroup(student.class_group || "");
    setEditDiagnosis(student.diagnosis || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditGrade("");
    setEditClassGroup("");
    setEditDiagnosis("");
  };

  const handleSave = async (studentId: string) => {
    if (!editName.trim()) {
      setMessage({ type: "err", text: "Nome é obrigatório." });
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/students/${studentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          grade: editGrade.trim() || null,
          class_group: editClassGroup.trim() || null,
          diagnosis: editDiagnosis.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "err", text: data.error || "Erro ao atualizar estudante." });
        return;
      }

      // Atualiza a lista local
      setStudents((prev) =>
        prev.map((s) =>
          s.id === studentId
            ? {
                ...s,
                name: editName.trim(),
                grade: editGrade.trim() || null,
                class_group: editClassGroup.trim() || null,
                diagnosis: editDiagnosis.trim() || null,
              }
            : s
        )
      );

      setMessage({ type: "ok", text: "Estudante atualizado com sucesso!" });
      setEditingId(null);
      setTimeout(() => setMessage(null), 3000);
    } catch (e) {
      setMessage({ type: "err", text: "Erro ao atualizar. Tente novamente." });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (studentId: string) => {
    setDeleting(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/students/${studentId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "err", text: data.error || "Erro ao excluir estudante." });
        return;
      }

      // Remove da lista local
      setStudents((prev) => prev.filter((s) => s.id !== studentId));
      setConfirmDeleteId(null);
      setMessage({ type: "ok", text: "Estudante excluído com sucesso!" });
      setTimeout(() => {
        setMessage(null);
        router.refresh();
      }, 2000);
    } catch (e) {
      setMessage({ type: "err", text: "Erro ao excluir. Tente novamente." });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-4">
        <input
          type="search"
          placeholder="Buscar por nome, série, turma..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm w-72 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
        />
        <div className="flex gap-2">
          <Link
            href="/pei"
            className="px-4 py-2 bg-sky-600 text-white text-sm font-medium rounded-lg hover:bg-sky-700 transition-colors"
          >
            Ir para PEI
          </Link>
          <Link
            href="/"
            className="px-4 py-2 border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
          >
            Voltar
          </Link>
        </div>
      </div>

      {message && (
        <div
          className={`mx-4 mt-4 p-3 rounded-lg text-sm ${
            message.type === "ok" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {students.length === 0 ? (
        <div className="p-12 text-center">
          <div className="text-4xl mb-4">📋</div>
          <p className="text-slate-600 font-medium">Nenhum estudante encontrado</p>
          <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
            Para começar, crie um PEI no módulo Estratégias & PEI — o estudante é cadastrado junto com o plano.
          </p>
          <div className="mt-6 flex gap-3 justify-center">
            <Link
              href="/pei"
              className="px-4 py-2 bg-sky-600 text-white text-sm font-medium rounded-lg hover:bg-sky-700"
            >
              Ir para Estratégias & PEI
            </Link>
            <Link
              href="/"
              className="px-4 py-2 border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50"
            >
              Página Inicial
            </Link>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-slate-600">Nenhum resultado para &quot;{search}&quot;</p>
          <button
            type="button"
            onClick={() => setSearch("")}
            className="mt-2 text-sm text-sky-600 hover:underline"
          >
            Limpar busca
          </button>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {filtered.map((s) => {
            const peiData = (s.pei_data || {}) as Record<string, unknown>;
            const paeeCiclos = (s.paee_ciclos || []) as unknown[];
            const temRelatorio = Boolean((peiData?.ia_sugestao as string)?.trim());
            const temJornada = Boolean((peiData?.ia_mapa_texto as string)?.trim());
            const nCiclos = paeeCiclos.length;
            const isEditing = editingId === s.id;
            const isDeleting = confirmDeleteId === s.id;

            return (
              <div key={s.id} className="p-4 hover:bg-slate-50/50 transition-colors">
                {isDeleting ? (
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                      <p className="text-sm font-semibold text-red-800 mb-2">
                        ⚠️ Confirmar exclusão permanente
                      </p>
                      <p className="text-xs text-red-700">
                        Esta ação não pode ser desfeita. Todos os dados do estudante (PEI, PAEE, Diário) serão
                        removidos permanentemente.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleDelete(s.id)}
                        disabled={deleting}
                        className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50"
                      >
                        {deleting ? "Excluindo…" : "Sim, excluir permanentemente"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-4 py-2 border border-slate-200 text-slate-700 text-sm rounded-lg hover:bg-slate-50"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : isEditing ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Nome *</label>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                          placeholder="Nome completo"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Série/Ano</label>
                        <input
                          type="text"
                          value={editGrade}
                          onChange={(e) => setEditGrade(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                          placeholder="Ex: 3º ano"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Turma</label>
                        <input
                          type="text"
                          value={editClassGroup}
                          onChange={(e) => setEditClassGroup(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                          placeholder="Ex: A"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Diagnóstico/Contexto</label>
                        <input
                          type="text"
                          value={editDiagnosis}
                          onChange={(e) => setEditDiagnosis(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                          placeholder="Contexto (equipe)"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleSave(s.id)}
                        disabled={saving}
                        className="px-4 py-2 bg-sky-600 text-white text-sm rounded-lg hover:bg-sky-700 disabled:opacity-50"
                      >
                        {saving ? "Salvando…" : "Salvar"}
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="px-4 py-2 border border-slate-200 text-slate-700 text-sm rounded-lg hover:bg-slate-50"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-800">{s.name || "—"}</h3>
                      <div className="flex gap-2 mt-1 flex-wrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-sky-50 text-sky-700 border border-sky-100">
                          {s.grade || "—"}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                          {s.class_group || "—"}
                        </span>
                        {temRelatorio && (
                          <span className="text-xs text-amber-600">📄 PEI</span>
                        )}
                        {temJornada && (
                          <span className="text-xs text-violet-600">🗺️ Jornada</span>
                        )}
                        {nCiclos > 0 && (
                          <span className="text-xs text-slate-500">{nCiclos} ciclo(s) PAEE</span>
                        )}
                      </div>
                      {s.diagnosis && (
                        <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                          Contexto (equipe): {s.diagnosis}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 shrink-0 flex-wrap">
                      <Link
                        href={`/pei?student=${s.id}`}
                        className="px-3 py-1.5 text-sm font-medium text-sky-600 hover:bg-sky-50 rounded-lg"
                      >
                        PEI
                      </Link>
                      <Link
                        href={`/paee?student=${s.id}`}
                        className="px-3 py-1.5 text-sm font-medium text-violet-600 hover:bg-violet-50 rounded-lg"
                      >
                        PAEE
                      </Link>
                      <Link
                        href={`/diario?student=${s.id}`}
                        className="px-3 py-1.5 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg"
                      >
                        Diário
                      </Link>
                      <Link
                        href={`/monitoramento?student=${s.id}`}
                        className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                      >
                        Monitoramento
                      </Link>
                      <button
                        type="button"
                        onClick={() => startEdit(s)}
                        className="px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(s.id)}
                        className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      {students.length > 0 && (
        <p className="p-3 text-xs text-slate-400 border-t border-slate-100">
          Dados sensíveis: uso exclusivo da equipe pedagógica. Não compartilhar com estudantes ou famílias.
        </p>
      )}
    </div>
  );
}
