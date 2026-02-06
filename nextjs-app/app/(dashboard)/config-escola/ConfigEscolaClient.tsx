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
    if (!activeYear?.id) {
      setClasses([]);
      return;
    }
    const res = await fetch(
      `/api/school/classes?school_year_id=${activeYear.id}`
    );
    const data = await res.json();
    setClasses(data.classes ?? []);
  }, [years]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadYears();
      await loadGrades();
      setLoading(false);
    })();
  }, [loadYears, loadGrades]);

  useEffect(() => {
    if (years.length > 0) loadClasses();
    else setClasses([]);
  }, [years, loadClasses]);

  const activeYear = years.find((y) => y.active) ?? years[0];
  const gradeOpts = grades.map((g) => ({
    id: g.id,
    label: g.label || g.code || g.id,
  }));

  return (
    <div className="space-y-8">
      <p className="text-sm text-slate-600">
        Ordem sugerida: 1) Ano letivo → 2) Séries da escola → 3) Turmas → 4)
        Depois cadastre usuários em Gestão de Usuários.
      </p>

      {message && (
        <div
          className={`p-3 rounded-lg text-sm ${
            message.type === "ok"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* 1. Ano Letivo */}
      <section>
        <h3 className="text-lg font-semibold text-slate-800 mb-2">
          1. Ano Letivo
        </h3>
        <NovoAnoForm
          onSuccess={() => {
            loadYears();
            setMessage({ type: "ok", text: "Ano letivo adicionado." });
          }}
          onError={(e) => setMessage({ type: "err", text: e })}
        />
        <div className="mt-4 p-4 rounded-xl border border-slate-200 bg-slate-50/50">
          <p className="text-sm font-medium text-slate-600 mb-2">
            Anos cadastrados
          </p>
          {loading ? (
            <p className="text-slate-500">Carregando…</p>
          ) : years.length === 0 ? (
            <p className="text-slate-600">Nenhum ano letivo. Adicione acima.</p>
          ) : (
            <ul className="space-y-1">
              {years.map((y) => (
                <li key={y.id}>
                  • <strong>{y.year}</strong> — {y.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* 2. Séries */}
      <section>
        <h3 className="text-lg font-semibold text-slate-800 mb-2">
          2. Séries que a escola oferece
        </h3>
        <p className="text-sm text-slate-600 mb-3">
          Selecione as séries que sua escola tem.
        </p>
        {loading ? (
          <p className="text-slate-500">Carregando…</p>
        ) : (
          <SalvarSeriesForm
            grades={gradeOpts}
            selectedIds={selectedGradeIds}
            onSuccess={() => {
              loadGrades();
              setMessage({ type: "ok", text: "Séries salvas." });
            }}
            onError={(e) => setMessage({ type: "err", text: e })}
          />
        )}
      </section>

      {/* 3. Turmas */}
      <section>
        <h3 className="text-lg font-semibold text-slate-800 mb-2">
          3. Turmas (série + turma)
        </h3>
        {!years.length ? (
          <p className="text-slate-600">Crie um ano letivo antes de cadastrar turmas.</p>
        ) : (
          <>
            <NovaTurmaForm
              years={years}
              grades={grades}
              onSuccess={() => {
                loadClasses();
                setMessage({ type: "ok", text: "Turma adicionada." });
              }}
              onError={(e) => setMessage({ type: "err", text: e })}
            />
            <div className="mt-4 p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <p className="text-sm font-medium text-slate-600 mb-2">
                Turmas criadas ({activeYear?.year ?? "—"})
              </p>
              {classes.length === 0 ? (
                <p className="text-slate-600">
                  Nenhuma turma. Selecione séries acima e adicione turmas.
                </p>
              ) : (
                <ul className="space-y-2">
                  {classes.map((c) => {
                    const lbl =
                      (c.grades?.label || c.grades?.code || "") + " " + (c.class_group || "");
                    return (
                      <li
                        key={c.id}
                        className="flex items-center justify-between py-1"
                      >
                        <span>• {lbl.trim()}</span>
                        <RemoverTurmaBtn
                          classId={c.id}
                          label={lbl.trim()}
                          onSuccess={() => {
                            loadClasses();
                            setMessage({ type: "ok", text: "Turma removida." });
                          }}
                          onError={(e) => setMessage({ type: "err", text: e })}
                        />
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

function NovoAnoForm({
  onSuccess,
  onError,
}: {
  onSuccess: () => void;
  onError: (e: string) => void;
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
        onError(data.error || "Erro ao salvar.");
        return;
      }
      onSuccess();
      setName("");
    } catch {
      onError("Erro de conexão.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-3 items-end">
      <div>
        <label className="block text-xs text-slate-500 mb-1">Ano</label>
        <input
          type="number"
          min={2020}
          max={2030}
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm w-24"
        />
      </div>
      <div>
        <label className="block text-xs text-slate-500 mb-1">Nome (opcional)</label>
        <input
          type="text"
          placeholder="Ex: 2025"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm w-32"
        />
      </div>
      <button
        type="submit"
        disabled={saving}
        className="px-4 py-2 bg-sky-600 text-white rounded-lg text-sm hover:bg-sky-700 disabled:opacity-60"
      >
        Adicionar
      </button>
    </form>
  );
}

function SalvarSeriesForm({
  grades,
  selectedIds,
  onSuccess,
  onError,
}: {
  grades: { id: string; label: string }[];
  selectedIds: string[];
  onSuccess: () => void;
  onError: (e: string) => void;
}) {
  const [selected, setSelected] = useState<string[]>(selectedIds);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSelected(selectedIds);
  }, [selectedIds]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/school/grades", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grade_ids: selected }),
      });
      const data = await res.json();
      if (!res.ok) {
        onError(data.error || "Erro ao salvar.");
        return;
      }
      onSuccess();
    } catch {
      onError("Erro de conexão.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {grades.map((g) => (
          <label
            key={g.id}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white cursor-pointer hover:bg-slate-50"
          >
            <input
              type="checkbox"
              checked={selected.includes(g.id)}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelected((p) => [...p, g.id]);
                } else {
                  setSelected((p) => p.filter((id) => id !== g.id));
                }
              }}
              className="rounded border-slate-300"
            />
            <span className="text-sm">{g.label}</span>
          </label>
        ))}
      </div>
      <button
        type="submit"
        disabled={saving}
        className="px-4 py-2 bg-sky-600 text-white rounded-lg text-sm hover:bg-sky-700 disabled:opacity-60"
      >
        Salvar séries
      </button>
    </form>
  );
}

function NovaTurmaForm({
  years,
  grades,
  onSuccess,
  onError,
}: {
  years: SchoolYear[];
  grades: Grade[];
  onSuccess: () => void;
  onError: (e: string) => void;
}) {
  const [segmentId, setSegmentId] = useState(SEGMENTS[0]?.id ?? "EFAI");
  const [yearId, setYearId] = useState(years[0]?.id ?? "");
  const [gradeId, setGradeId] = useState("");
  const [classGroup, setClassGroup] = useState("A");
  const [saving, setSaving] = useState(false);
  const [gradesForSegment, setGradesForSegment] = useState<Grade[]>([]);

  useEffect(() => {
    setYearId(years[0]?.id ?? "");
  }, [years]);

  useEffect(() => {
    const ids = new Set(
      grades.filter((g) => g.segment_id === segmentId).map((g) => g.id)
    );
    setGradesForSegment(grades.filter((g) => ids.has(g.id)));
    setGradeId("");
  }, [segmentId, grades]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!yearId || !gradeId) {
      onError("Selecione ano letivo e série.");
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
        onError(data.error || "Erro ao salvar.");
        return;
      }
      onSuccess();
      setClassGroup("A");
    } catch {
      onError("Erro de conexão.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-4 items-end">
      <div>
        <label className="block text-xs text-slate-500 mb-1">Segmento</label>
        <select
          value={segmentId}
          onChange={(e) => setSegmentId(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
        >
          {SEGMENTS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs text-slate-500 mb-1">Ano letivo</label>
        <select
          value={yearId}
          onChange={(e) => setYearId(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
        >
          {years.map((y) => (
            <option key={y.id} value={y.id}>
              {y.year} — {y.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs text-slate-500 mb-1">Série</label>
        <select
          value={gradeId}
          onChange={(e) => setGradeId(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
        >
          <option value="">—</option>
          {gradesForSegment.map((g) => (
            <option key={g.id} value={g.id}>
              {g.label || g.code}
            </option>
          ))}
        </select>
        {gradesForSegment.length === 0 && (
          <p className="text-xs text-amber-600 mt-1">
            Selecione séries acima primeiro.
          </p>
        )}
      </div>
      <div>
        <label className="block text-xs text-slate-500 mb-1">Turma</label>
        <input
          type="text"
          placeholder="A, B, 1..."
          value={classGroup}
          onChange={(e) => setClassGroup(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm w-20"
        />
      </div>
      <button
        type="submit"
        disabled={saving || !gradeId}
        className="px-4 py-2 bg-sky-600 text-white rounded-lg text-sm hover:bg-sky-700 disabled:opacity-60"
      >
        Adicionar turma
      </button>
    </form>
  );
}

function RemoverTurmaBtn({
  classId,
  label,
  onSuccess,
  onError,
}: {
  classId: string;
  label: string;
  onSuccess: () => void;
  onError: (e: string) => void;
}) {
  const [confirm, setConfirm] = useState(false);

  async function handleDelete() {
    const res = await fetch(`/api/school/classes/${classId}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const data = await res.json();
      onError(data.error || "Erro ao remover.");
      return;
    }
    setConfirm(false);
    onSuccess();
  }

  if (confirm) {
    return (
      <div className="flex gap-2 items-center">
        <span className="text-xs text-amber-600">Remover?</span>
        <button
          type="button"
          onClick={handleDelete}
          className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
        >
          Sim
        </button>
        <button
          type="button"
          onClick={() => setConfirm(false)}
          className="px-2 py-1 text-xs border border-slate-200 rounded hover:bg-slate-50"
        >
          Não
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirm(true)}
      className="text-xs text-red-600 hover:underline"
    >
      Remover
    </button>
  );
}
