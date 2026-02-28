"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ClipboardList, FileText, Map, Trash2, ChevronDown, ChevronUp, X, AlertTriangle, Edit2, Save, XCircle } from "lucide-react";
import { ResponsaveisSection } from "@/components/ResponsaveisSection";

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
  familyModuleEnabled?: boolean;
};

export function EstudantesClient({ students, familyModuleEnabled = false }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [updating, setUpdating] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    name: string;
    grade: string;
    class_group: string;
    diagnosis: string;
  } | null>(null);
  const [saving, setSaving] = useState(false);

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

  function toggleExpand(studentId: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(studentId)) {
        next.delete(studentId);
      } else {
        next.add(studentId);
      }
      return next;
    });
  }

  async function handleDelete(studentId: string) {
    if (!confirm("Tem certeza que deseja excluir este estudante? Esta ação não pode ser desfeita.")) {
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`/api/students/${studentId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Erro ao excluir estudante.");
        return;
      }
      router.refresh();
    } catch (err) {
      alert("Erro ao excluir estudante. Tente novamente.");
      console.error(err);
    } finally {
      setDeleting(false);
      setConfirmDeleteId(null);
    }
  }

  async function handleApagarRelatorios(studentId: string, peiData: Record<string, unknown>) {
    if (!confirm("Apagar relatórios PEI? Esta ação não pode ser desfeita.")) {
      return;
    }

    setUpdating(studentId);
    try {
      const peiNovo = { ...peiData };
      peiNovo.ia_sugestao = "";
      peiNovo.status_validacao_pei = "rascunho";

      const res = await fetch(`/api/students/${studentId}/pei-data`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pei_data: peiNovo }),
      });

      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Erro ao apagar relatórios.");
      }
    } catch (err) {
      alert("Erro ao apagar relatórios. Tente novamente.");
      console.error(err);
    } finally {
      setUpdating(null);
    }
  }

  async function handleApagarJornada(studentId: string, peiData: Record<string, unknown>) {
    if (!confirm("Apagar jornada gamificada? Esta ação não pode ser desfeita.")) {
      return;
    }

    setUpdating(studentId);
    try {
      const peiNovo = { ...peiData };
      peiNovo.ia_mapa_texto = "";
      peiNovo.status_validacao_game = "rascunho";

      const res = await fetch(`/api/students/${studentId}/pei-data`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pei_data: peiNovo }),
      });

      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Erro ao apagar jornada.");
      }
    } catch (err) {
      alert("Erro ao apagar jornada. Tente novamente.");
      console.error(err);
    } finally {
      setUpdating(null);
    }
  }

  function iniciarEdicao(student: Student) {
    setEditingId(student.id);
    setEditForm({
      name: student.name || "",
      grade: student.grade || "",
      class_group: student.class_group || "",
      diagnosis: student.diagnosis || "",
    });
  }

  function cancelarEdicao() {
    setEditingId(null);
    setEditForm(null);
  }

  async function salvarEdicao(studentId: string) {
    if (!editForm) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/students/${studentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name.trim() || null,
          grade: editForm.grade.trim() || null,
          class_group: editForm.class_group.trim() || null,
          diagnosis: editForm.diagnosis.trim() || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Erro ao salvar alterações.");
        return;
      }

      setEditingId(null);
      setEditForm(null);
      router.refresh();
    } catch (err) {
      alert("Erro ao salvar alterações. Tente novamente.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function handleApagarCiclos(studentId: string) {
    if (!confirm("Apagar todos os ciclos PAEE? Esta ação não pode ser desfeita.")) {
      return;
    }

    setUpdating(studentId);
    try {
      const res = await fetch(`/api/students/${studentId}/paee-ciclos`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paee_ciclos: [] }),
      });

      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Erro ao apagar ciclos.");
      }
    } catch (err) {
      alert("Erro ao apagar ciclos. Tente novamente.");
      console.error(err);
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div className="bg-white rounded-2xl" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.02)', border: '1px solid rgba(226,232,240,0.6)' }}>
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

      {students.length === 0 ? (
        <div className="p-12 text-center">
          <div className="mb-4 flex justify-center">
            <ClipboardList className="w-16 h-16 text-slate-400" />
          </div>
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
            const paeeCiclos = Array.isArray(s.paee_ciclos) ? s.paee_ciclos : [];
            const temRelatorio = Boolean((peiData?.ia_sugestao as string)?.trim());
            const temJornada = Boolean((peiData?.ia_mapa_texto as string)?.trim());
            const nCiclos = paeeCiclos.length;
            const isExpanded = expandedIds.has(s.id);
            const isConfirmingDelete = confirmDeleteId === s.id;
            const isUpdating = updating === s.id;

            return (
              <div
                key={s.id}
                className="border-b border-slate-100 last:border-b-0"
              >
                {/* Header do estudante */}
                <div className="p-4 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <button
                        type="button"
                        onClick={() => toggleExpand(s.id)}
                        className="w-full text-left flex items-center justify-between gap-2 group"
                      >
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-800 group-hover:text-sky-600 transition-colors">
                            {s.name || "—"}
                          </h3>
                          <div className="flex gap-2 mt-1 flex-wrap">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-sky-50 text-sky-700 border border-sky-100">
                              {s.grade || "—"}
                            </span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                              {s.class_group || "—"}
                            </span>
                            {temRelatorio && (
                              <span className="text-xs text-amber-600 inline-flex items-center gap-1">
                                <FileText className="w-3 h-3" />
                                PEI
                              </span>
                            )}
                            {temJornada && (
                              <span className="text-xs text-violet-600 inline-flex items-center gap-1">
                                <Map className="w-3 h-3" />
                                Jornada
                              </span>
                            )}
                            {nCiclos > 0 && (
                              <span className="text-xs text-slate-500">{nCiclos} ciclo(s) PAEE</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                      </button>
                    </div>
                    <div className="flex gap-2 shrink-0 flex-wrap items-center">
                      <Link
                        href={`/pei?student=${s.id}`}
                        className="px-3 py-1.5 text-sm font-medium text-sky-600 hover:bg-sky-50 rounded-lg"
                        onClick={(e) => e.stopPropagation()}
                      >
                        PEI
                      </Link>
                      <Link
                        href={`/paee?student=${s.id}`}
                        className="px-3 py-1.5 text-sm font-medium text-violet-600 hover:bg-violet-50 rounded-lg"
                        onClick={(e) => e.stopPropagation()}
                      >
                        PAEE
                      </Link>
                      <Link
                        href={`/diario?student=${s.id}`}
                        className="px-3 py-1.5 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Diário
                      </Link>
                      <Link
                        href={`/monitoramento?student=${s.id}`}
                        className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Monitoramento
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Conteúdo expandido */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-0 bg-slate-50/30 border-t border-slate-100">
                    {isConfirmingDelete ? (
                      <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="flex items-start gap-2 mb-3">
                          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold text-amber-800">Excluir {s.name}?</p>
                            <p className="text-sm text-amber-700 mt-1">Esta ação não pode ser desfeita.</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDelete(s.id)}
                            disabled={deleting}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm"
                          >
                            Sim, excluir
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-sm"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 space-y-4">
                        {/* Edição Inline de Campos Básicos */}
                        {editingId === s.id ? (
                          <div className="bg-white border border-sky-200 rounded-lg p-4 space-y-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-sm font-semibold text-slate-800">Editar dados do estudante</h4>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => salvarEdicao(s.id)}
                                  disabled={saving}
                                  className="px-3 py-1.5 text-xs font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-lg disabled:opacity-50 flex items-center gap-1.5"
                                >
                                  <Save className="w-3.5 h-3.5" />
                                  Salvar
                                </button>
                                <button
                                  onClick={cancelarEdicao}
                                  disabled={saving}
                                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-300 disabled:opacity-50 flex items-center gap-1.5"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  Cancelar
                                </button>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Nome</label>
                                <input
                                  type="text"
                                  value={editForm?.name || ""}
                                  onChange={(e) => setEditForm({ ...editForm!, name: e.target.value })}
                                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                                  placeholder="Nome do estudante"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Série</label>
                                <input
                                  type="text"
                                  value={editForm?.grade || ""}
                                  onChange={(e) => setEditForm({ ...editForm!, grade: e.target.value })}
                                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                                  placeholder="Ex: 1º ano, 2º ano"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Turma</label>
                                <input
                                  type="text"
                                  value={editForm?.class_group || ""}
                                  onChange={(e) => setEditForm({ ...editForm!, class_group: e.target.value })}
                                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                                  placeholder="Ex: A, B, C"
                                />
                              </div>
                              <div className="md:col-span-2">
                                <label className="block text-xs font-medium text-slate-700 mb-1">Contexto (equipe)</label>
                                <textarea
                                  value={editForm?.diagnosis || ""}
                                  onChange={(e) => setEditForm({ ...editForm!, diagnosis: e.target.value })}
                                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none"
                                  placeholder="Diagnóstico ou contexto do estudante"
                                  rows={3}
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-sm font-semibold text-slate-800">Dados básicos</h4>
                              <button
                                onClick={() => iniciarEdicao(s)}
                                className="px-3 py-1.5 text-xs font-medium text-sky-600 hover:bg-sky-50 rounded-lg border border-sky-200 flex items-center gap-1.5"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                Editar
                              </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                              <div>
                                <span className="text-slate-500">Nome:</span>
                                <span className="ml-2 font-medium text-slate-800">{s.name || "—"}</span>
                              </div>
                              <div>
                                <span className="text-slate-500">Série:</span>
                                <span className="ml-2 font-medium text-slate-800">{s.grade || "—"}</span>
                              </div>
                              <div>
                                <span className="text-slate-500">Turma:</span>
                                <span className="ml-2 font-medium text-slate-800">{s.class_group || "—"}</span>
                              </div>
                              {s.diagnosis && (
                                <div className="md:col-span-2">
                                  <span className="text-slate-500">Contexto (equipe):</span>
                                  <p className="mt-1 text-slate-700">{s.diagnosis}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Contexto (modo visualização - apenas se não estiver editando) */}
                        {editingId !== s.id && s.diagnosis && (
                          <div>
                            <p className="text-sm font-semibold text-slate-700 mb-1">Contexto (equipe):</p>
                            <p className="text-sm text-slate-600">{s.diagnosis}</p>
                          </div>
                        )}

                        {/* Responsáveis (Módulo Família) */}
                        {familyModuleEnabled && (
                          <ResponsaveisSection
                            studentId={s.id}
                            studentName={s.name || "—"}
                            onRefresh={() => router.refresh()}
                          />
                        )}

                        {/* O que está anexado */}
                        <div>
                          <p className="text-sm font-semibold text-slate-700 mb-2">O que está anexado</p>
                          <div className="space-y-1 mb-3">
                            {temRelatorio && (
                              <p className="text-sm text-slate-600 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-amber-600" />
                                Relatório PEI (Consultoria IA)
                              </p>
                            )}
                            {temJornada && (
                              <p className="text-sm text-slate-600 flex items-center gap-2">
                                <Map className="w-4 h-4 text-violet-600" />
                                Jornada gamificada
                              </p>
                            )}
                            {nCiclos > 0 && (
                              <p className="text-sm text-slate-600 flex items-center gap-2">
                                <ClipboardList className="w-4 h-4 text-slate-600" />
                                Ciclos PAEE ({nCiclos})
                              </p>
                            )}
                            {!temRelatorio && !temJornada && nCiclos === 0 && (
                              <p className="text-xs text-slate-500 italic">Nenhum relatório ou jornada anexada ainda.</p>
                            )}
                          </div>

                          {/* Botões para apagar */}
                          {(temRelatorio || temJornada || nCiclos > 0) && (
                            <div>
                              <p className="text-xs text-slate-500 mb-2">Apagar apenas relatórios ou jornada (sem excluir o estudante):</p>
                              <div className="flex flex-wrap gap-2">
                                {temRelatorio && (
                                  <button
                                    onClick={() => handleApagarRelatorios(s.id, peiData)}
                                    disabled={isUpdating}
                                    className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg border border-red-200 disabled:opacity-50"
                                  >
                                    Apagar relatórios
                                  </button>
                                )}
                                {temJornada && (
                                  <button
                                    onClick={() => handleApagarJornada(s.id, peiData)}
                                    disabled={isUpdating}
                                    className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg border border-red-200 disabled:opacity-50"
                                  >
                                    Apagar jornada
                                  </button>
                                )}
                                {nCiclos > 0 && (
                                  <button
                                    onClick={() => handleApagarCiclos(s.id)}
                                    disabled={isUpdating}
                                    className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg border border-red-200 disabled:opacity-50"
                                  >
                                    Apagar ciclos PAEE
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* PEI Data completa (visualização) */}
                        {Object.keys(peiData).length > 0 && (
                          <div>
                            <p className="text-sm font-semibold text-slate-700 mb-2">Dados completos do PEI</p>
                            <div className="bg-white border border-slate-200 rounded-lg p-4 max-h-96 overflow-y-auto">
                              <pre className="text-xs text-slate-600 whitespace-pre-wrap font-mono">
                                {JSON.stringify(peiData, null, 2)}
                              </pre>
                            </div>
                          </div>
                        )}

                        {/* Botão excluir */}
                        <div className="pt-2 border-t border-slate-200">
                          <button
                            onClick={() => setConfirmDeleteId(s.id)}
                            disabled={deleting || isUpdating}
                            className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg border border-red-200 disabled:opacity-50 flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            Excluir estudante
                          </button>
                        </div>
                      </div>
                    )}
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
