"use client";

import { useState, useEffect, useCallback } from "react";

type SchoolYear = { id: string; year: number; name: string; active?: boolean };
type Grade = { id: string; code: string; label: string; segment_id?: string };
type ClassRow = {
  id: string;
  class_group: string;
  grades?: { code?: string; label?: string };
};

const SEGMENTS = [
  { id: "EI", label: "Educação Infantil" },
  { id: "EFAI", label: "EF - Anos Iniciais (1º ao 5º)" },
  { id: "EFAF", label: "EF - Anos Finais (6º ao 9º)" },
  { id: "EM", label: "Ensino Médio" },
];

export function ConfigEscolaClient() {
  const [years, setYears] = useState<SchoolYear[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [selectedGradeIds, setSelectedGradeIds] = useState<string[]>([]);
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [confirmDelClass, setConfirmDelClass] = useState<string | null>(null);

  const loadYears = useCallback(async () => {
    const res = await fetch("/api/school/years");
    const data = await res.json();
    setYears(data.years ?? []);
  }, []);

  const loadGrades = useCallback(async () => {
    const res = await fetch("/api/school/grades");
    const data = await res.json();
    setGrades(data.grades ?? []);
    setSelectedGradeIds(data.selected_ids ?? []);
  }, []);

  const loadClasses = useCallback(async () => {
    const activeYear = years.find((y) => y.active) ?? years[0];
    if (!activeYear?.id) return;
    const res = await fetch(`/api/school/classes?school_year_id=${activeYear.id}`);
    const data = await res.json();
    setClasses(data.classes ?? []);
  }, [years]);

  useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        await loadYears();
        await loadGrades();
      } catch {
        setMessage({ type: "err", text: "Erro ao carregar dados." });
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [loadYears, loadGrades]);

  useEffect(() => {
    if (years.length > 0) loadClasses();
  }, [years, loadClasses]);

  const gradeOptions = SEGMENTS.flatMap((seg) => {
    const segGrades = grades.filter((g) => g.segment_id === seg.id);
    return segGrades.map((g) => ({
      ...g,
      _seg: seg.label,
      _label: `${seg.label}: ${g.label || g.code}`,
    }));
  });

  const activeYear = years.find((y) => y.active) ?? years[0];

  return (
    <div className="space-y-8">
      <p className="text-sm text-slate-600">
        Ordem sugerida: 1) Ano letivo → 2) Séries da escola → 3) Turmas → 4) Depois cadastre usuários em Gestão.
      </p>

      {message && (
        <div
          className={`p-3 rounded-lg text-sm ${
            message.type === "ok" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* 1. Ano Letivo */}
      <section>
        <h3 className="text-lg font-semibold text-slate-800 mb-3">1. Ano Letivo</h3>
        <AddYearForm onSuccess={() => { loadYears(); setMessage({ type: "ok", text: "Ano letivo adicionado." }); }} onError={(e) => setMessage({ type: "err", text: e })} />
        <div className="mt-4 p-4 rounded-xl border border-slate-200 bg-slate-50/50">
          <p className="text-sm font-medium text-slate-600 mb-2">Anos cadastrados</p>
          {loading ? (
            <p className="text-slate-500">Carregando…</p>
          ) : years.length === 0 ? (
            <p className="text-slate-500">Nenhum ano letivo. Adicione acima.</p>
          ) : (
            <ul className="space-y-1">
              {years.map((y) => (
                <li key={y.id} className="text-sm text-slate-700">
                  • {y.year} — {y.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* 2. Séries */}
      <section>
        <h3 className="text-lg font-semibold text-slate-800 mb-3">2. Séries que a escola oferece</h3>
        <p className="text-sm text-slate-500 mb-2">Selecione as séries que sua escola tem.</p>
        <GradesSelector
          gradeOptions={gradeOptions}
          selectedIds={selectedGradeIds}
          onChange={setSelectedGradeIds}
          onSave={async (ids) => {
            const res = await fetch("/api/school/grades", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ grade_ids: ids }),
            });
            if (!res.ok) {
              const d = await res.json();
              setMessage({ type: "err", text: d.error || "Erro ao salvar." });
              return;
            }
            setMessage({ type: "ok", text: "Séries salvas." });
          }}
          onError={(e) => setMessage({ type: "err", text: e })}
        />
      </section>

      {/* 3. Turmas */}
      <section>
        <h3 className="text-lg font-semibold text-slate-800 mb-3">3. Turmas (série + turma)</h3>
        {!activeYear ? (
          <p className="text-slate-500">Crie um ano letivo antes de cadastrar turmas.</p>
        ) : (
          <>
            <AddClassForm
              years={years}
              activeYearId={activeYear.id}
              onSuccess={() => {
                loadClasses();
                loadGrades();
                setMessage({ type: "ok", text: "Turma adicionada." });
              }}
              onError={(e) => setMessage({ type: "err", text: e })}
            />
            <div className="mt-4 p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <p className="text-sm font-medium text-slate-600 mb-2">Turmas criadas ({activeYear.year})</p>
              {classes.length === 0 ? (
                <p className="text-slate-500">
                  Nenhuma turma. Selecione as séries acima e adicione turmas no formulário.
                </p>
              ) : (
                <ul className="space-y-2">
                  {classes.map((c) => {
                    const gr = c.grades ?? {};
                    const lbl = `${gr?.label ?? ""} ${c.class_group ?? ""}`.trim();
                    const isConfirm = confirmDelClass === c.id;
                    return (
                      <li key={c.id} className="flex items-center justify-between text-sm">
                        <span className="text-slate-700">• {lbl || c.class_group}</span>
                        {isConfirm ? (
                          <span className="flex gap-2">
                            <button
                              type="button"
                              onClick={async () => {
                                const res = await fetch(`/api/school/classes/${c.id}`, {
                                  method: "DELETE",
                                });
                                if (!res.ok) {
                                  setMessage({ type: "err", text: "Erro ao remover." });
                                  return;
                                }
                                setConfirmDelClass(null);
                                loadClasses();
                                setMessage({ type: "ok", text: "Turma removida." });
                              }}
                              className="px-2 py-1 bg-red-600 text-white rounded text-xs"
                            >
                              Sim, remover
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDelClass(null)}
                              className="px-2 py-1 border border-slate-200 rounded text-xs"
                            >
                              Cancelar
                            </button>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDelClass(c.id)}
                            className="text-red-600 text-xs hover:underline"
                          >
                            Remover
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function AddYearForm({
  onSuccess,
  onError,
}: {
  onSuccess: () => void;
  onError: (err: string) => void;
}) {
  const [year, setYear] = useState(new Date().getFullYear());
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/school/years", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year, name: name || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        onError(data.error || "Erro ao adicionar ano.");
        return;
      }
      setYear(new Date().getFullYear());
      setName("");
      onSuccess();
    } catch {
      onError("Erro de conexão.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-3 items-end">
      <div>
        <label className="block text-xs text-slate-600 mb-1">Ano</label>
        <input
          type="number"
          min={2020}
          max={2030}
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="w-24 px-3 py-2 border border-slate-200 rounded-lg text-sm"
        />
      </div>
      <div>
        <label className="block text-xs text-slate-600 mb-1">Nome (opcional)</label>
        <input
          type="text"
          placeholder="Ex: 2025"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-32 px-3 py-2 border border-slate-200 rounded-lg text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={saving}
        className="px-4 py-2 bg-sky-600 text-white rounded-lg text-sm hover:bg-sky-700 disabled:opacity-60"
      >
        {saving ? "..." : "Adicionar ano letivo"}
      </button>
    </form>
  );
}

function GradesSelector({
  gradeOptions,
  selectedIds,
  onChange,
  onSave,
  onError,
}: {
  gradeOptions: { id: string; _label: string }[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  onSave: (ids: string[]) => Promise<void>;
  onError: (err: string) => void;
}) {
  const [saving, setSaving] = useState(false);

  function toggle(id: string) {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((x) => x !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 border border-slate-200 rounded-lg bg-white">
        {gradeOptions.map((g) => (
          <label
            key={g.id}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 cursor-pointer text-sm"
          >
            <input
              type="checkbox"
              checked={selectedIds.includes(g.id)}
              onChange={() => toggle(g.id)}
              className="rounded border-slate-300"
            />
            {g._label}
          </label>
        ))}
      </div>
      <button
        type="button"
        onClick={async () => {
          setSaving(true);
          try {
            await onSave(selectedIds);
          } catch (e) {
            onError(String(e));
          } finally {
            setSaving(false);
          }
        }}
        disabled={saving}
        className="px-4 py-2 bg-sky-600 text-white rounded-lg text-sm hover:bg-sky-700 disabled:opacity-60"
      >
        {saving ? "Salvando…" : "Salvar séries"}
      </button>
    </div>
  );
}

function AddClassForm({
  years,
  activeYearId,
  onSuccess,
  onError,
}: {
  years: SchoolYear[];
  activeYearId: string;
  onSuccess: () => void;
  onError: (err: string) => void;
}) {
  const [segmentId, setSegmentId] = useState("EFAI");
  const [gradesForWorkspace, setGradesForWorkspace] = useState<Grade[]>([]);
  const [yearId, setYearId] = useState(activeYearId);
  const [gradeId, setGradeId] = useState("");
  const [classGroup, setClassGroup] = useState("A");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setYearId(activeYearId);
  }, [activeYearId]);

  useEffect(() => {
    fetch(`/api/school/grades?for_workspace=1&segment_id=${segmentId}`)
      .then((r) => r.json())
      .then((d) => {
        setGradesForWorkspace(d.grades ?? []);
        if (!gradeId && d.grades?.length) setGradeId(d.grades[0].id);
        else if (gradeId && !d.grades?.some((g: Grade) => g.id === gradeId))
          setGradeId(d.grades?.[0]?.id ?? "");
      })
      .catch(() => setGradesForWorkspace([]));
  }, [segmentId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!gradeId) {
      onError("Selecione as séries da escola antes de criar turmas.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/school/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          school_year_id: yearId,
          grade_id: gradeId,
          class_group: classGroup || "A",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        onError(data.error || "Erro ao adicionar turma.");
        return;
      }
      setClassGroup("A");
      onSuccess();
    } catch {
      onError("Erro de conexão.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-4 items-end p-4 rounded-xl border border-slate-200 bg-white">
      <div>
        <label className="block text-xs text-slate-600 mb-1">Segmento</label>
        <select
          value={segmentId}
          onChange={(e) => setSegmentId(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
        >
          {SEGMENTS.map((s) => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs text-slate-600 mb-1">Ano letivo</label>
        <select
          value={yearId}
          onChange={(e) => setYearId(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
        >
          {years.map((y) => (
            <option key={y.id} value={y.id}>{y.year} — {y.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs text-slate-600 mb-1">Série</label>
        <select
          value={gradeId}
          onChange={(e) => setGradeId(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
        >
          {gradesForWorkspace.length === 0 ? (
            <option value="">Selecione séries acima primeiro</option>
          ) : (
            gradesForWorkspace.map((g) => (
              <option key={g.id} value={g.id}>{g.label || g.code}</option>
            ))
          )}
        </select>
      </div>
      <div>
        <label className="block text-xs text-slate-600 mb-1">Turma</label>
        <input
          type="text"
          placeholder="A, B, 1..."
          value={classGroup}
          onChange={(e) => setClassGroup(e.target.value)}
          className="w-20 px-3 py-2 border border-slate-200 rounded-lg text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={saving || !gradeId}
        className="px-4 py-2 bg-sky-600 text-white rounded-lg text-sm hover:bg-sky-700 disabled:opacity-60"
      >
        {saving ? "..." : "Adicionar turma"}
      </button>
    </form>
  );
}
