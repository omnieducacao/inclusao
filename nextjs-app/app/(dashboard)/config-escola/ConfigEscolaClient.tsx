"use client";

import { useState, useEffect, useCallback } from "react";
import { useConfirmar } from "@/components/Confirmar";
import { DataCleanupPanel } from "@/components/DataCleanupPanel";

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
  const [familyModuleEnabled, setFamilyModuleEnabled] = useState(false);
  const [familyModuleSaving, setFamilyModuleSaving] = useState(false);
  const [allowAvaliacaoFase1, setAllowAvaliacaoFase1] = useState(false);
  const [allowAvaliacaoFase1Saving, setAllowAvaliacaoFase1Saving] = useState(false);
  const [modo, setModo] = useState<"completo" | "simplificado">("completo");
  const [modoSaving, setModoSaving] = useState(false);

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

  const loadWorkspaceConfig = useCallback(async () => {
    const res = await fetch("/api/workspace/config");
    if (!res.ok) return;
    const data = await res.json();
    setFamilyModuleEnabled(Boolean(data.family_module_enabled));
    setAllowAvaliacaoFase1(Boolean(data.allow_avaliacao_fase_1));
    setModo(data.modo === "simplificado" ? "simplificado" : "completo");
  }, []);

  useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        await loadYears();
        await loadGrades();
        await loadWorkspaceConfig();
      } catch { /* expected fallback */
        setMessage({ type: "err", text: "Não conseguimos carregar a configuração. Recarregue a página." });
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [loadYears, loadGrades, loadWorkspaceConfig]);

  useEffect(() => {
    if (years.length > 0) loadClasses();
  }, [years, loadClasses]);

  const gradeOptions = SEGMENTS.flatMap((seg) => {
    const segGrades = grades.filter((g) => g.segment_id === seg.id);
    return segGrades.map((g) => ({
      ...g,
      _seg: seg.label,
      _label: g.label || g.code,
    }));
  });

  const activeYear = years.find((y) => y.active) ?? years[0];
  const { confirmar, dialogo } = useConfirmar();

  // Onda 11: a mesma ordem dos Primeiros passos, com o estado de cada passo
  const passos = [
    { n: 1, titulo: "Ano letivo", feito: years.length > 0, ancora: "cfg-ano" },
    { n: 2, titulo: "Séries", feito: selectedGradeIds.length > 0, ancora: "cfg-series" },
    { n: 3, titulo: "Turmas", feito: classes.length > 0, ancora: "cfg-turmas" },
    { n: 4, titulo: "Equipe", feito: false, ancora: "", href: "/gestao" },
  ];

  // Turmas agrupadas por série ("4º Ano: A, B, C")
  const porSerie = classes.reduce<Record<string, ClassRow[]>>((acc, c) => {
    const k = c.grades?.label || c.grades?.code || "Sem série";
    (acc[k] = acc[k] || []).push(c);
    return acc;
  }, {});

  async function salvarConfig(campo: Record<string, unknown>, ok: string, setSalvando: (v: boolean) => void, aplicar: () => void) {
    setSalvando(true);
    try {
      const res = await fetch("/api/workspace/config", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(campo) });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setMessage({ type: "err", text: d.error || "Não foi possível salvar." });
        return;
      }
      aplicar();
      setMessage({ type: "ok", text: ok });
    } catch {
      setMessage({ type: "err", text: "Sem conexão. Tente de novo." });
    } finally {
      setSalvando(false);
    }
  }

  async function removerTurma(c: ClassRow) {
    const nome = `${c.grades?.label ?? ""} ${c.class_group ?? ""}`.trim();
    const ok = await confirmar({
      titulo: `Remover a turma ${nome}?`,
      texto: "Os estudantes continuam cadastrados, mas deixam de estar ligados a esta turma, e os professores dela perdem o vínculo com eles.",
      acao: "Remover turma",
      cancelar: "Manter",
      perigo: true,
    });
    if (!ok) return;
    const res = await fetch(`/api/school/classes/${c.id}`, { method: "DELETE" });
    if (!res.ok) { setMessage({ type: "err", text: "Não foi possível remover a turma." }); return; }
    loadClasses();
    setMessage({ type: "ok", text: `Turma ${nome} removida.` });
  }

  const secao = "omni-cartao omni-cartao--plano space-y-4";
  const titulo = { margin: 0, font: "800 19px/26px var(--font-sans)", color: "var(--tinta)" } as const;

  return (
    <div className="space-y-6">
      {dialogo}
      <nav aria-label="Passos da configuração">
        <ol className="omni-passos">
          {passos.map((p) => (
            <li key={p.n} className={`omni-passo ${p.feito ? "omni-passo--feito" : ""}`}>
              <span className="omni-passo__num" aria-hidden>{p.feito ? "✓" : p.n}</span>
              <span>
                <a href={p.href || `#${p.ancora}`} className="omni-passo__titulo" style={{ display: "block", color: "var(--tinta)", textDecoration: "none" }}>{p.titulo}</a>
                <span className="omni-passo__estado" style={{ display: "block" }}>{p.href ? "Em Equipe e papéis" : p.feito ? "Feito" : "A fazer"}</span>
              </span>
            </li>
          ))}
        </ol>
      </nav>

      {message && (
        <div className={`omni-aviso omni-aviso--${message.type === "ok" ? "sucesso" : "erro"}`} role={message.type === "ok" ? "status" : "alert"} style={{ maxWidth: "none" }}>
          <div><div className="omni-aviso__texto">{message.text}</div></div>
          <span />
        </div>
      )}

      {/* 1. Ano letivo */}
      <section id="cfg-ano" className={secao} aria-labelledby="cfg-ano-t">
        <div>
          <h2 id="cfg-ano-t" style={titulo}>1. Ano letivo</h2>
          <p className="omni-apoio" style={{ margin: 0 }}>As turmas são de um ano letivo. O mais recente é o que vale.</p>
        </div>
        {loading ? (
          <p className="omni-apoio">Carregando…</p>
        ) : years.length > 0 && (
          <ul className="flex flex-wrap gap-2" style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {years.map((y) => (
              <li key={y.id} className={`omni-estado ${y.id === activeYear?.id ? "omni-estado--sucesso" : "omni-estado--neutro"}`}>
                {y.year}{y.name && y.name !== String(y.year) ? ` · ${y.name}` : ""}{y.id === activeYear?.id ? " · em uso" : ""}
              </li>
            ))}
          </ul>
        )}
        <AddYearForm onSuccess={() => { loadYears(); setMessage({ type: "ok", text: "Ano letivo adicionado." }); }} onError={(e) => setMessage({ type: "err", text: e })} />
      </section>

      {/* 2. Séries */}
      <section id="cfg-series" className={secao} aria-labelledby="cfg-series-t">
        <div>
          <h2 id="cfg-series-t" style={titulo}>2. Séries que a escola oferece</h2>
          <p className="omni-apoio" style={{ margin: 0 }}>Marque as séries. Só elas aparecem na hora de criar turmas.</p>
        </div>
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
              const d = await res.json().catch(() => ({}));
              setMessage({ type: "err", text: d.error || "Não foi possível salvar as séries." });
              return;
            }
            setMessage({ type: "ok", text: "Séries salvas." });
          }}
          onError={(e) => setMessage({ type: "err", text: e })}
        />
      </section>

      {/* 3. Turmas */}
      <section id="cfg-turmas" className={secao} aria-labelledby="cfg-turmas-t">
        <div>
          <h2 id="cfg-turmas-t" style={titulo}>3. Turmas{activeYear ? ` de ${activeYear.year}` : ""}</h2>
          <p className="omni-apoio" style={{ margin: 0 }}>Série + letra da turma. É por elas que professores ficam ligados aos estudantes.</p>
        </div>
        {!activeYear ? (
          <p className="omni-apoio">Crie o ano letivo (passo 1) antes das turmas.</p>
        ) : (
          <>
            {classes.length > 0 && (
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 8 }}>
                {Object.entries(porSerie).map(([serie, lista]) => (
                  <li key={serie} className="flex flex-wrap items-center gap-2" style={{ paddingBottom: 8, borderBottom: "1px solid var(--borda)" }}>
                    <strong style={{ minWidth: 140, font: "700 15px/22px var(--font-sans)", color: "var(--tinta)" }}>{serie}</strong>
                    {lista.sort((a, b) => (a.class_group || "").localeCompare(b.class_group || "", "pt-BR", { numeric: true })).map((c) => (
                      <span key={c.id} className="omni-chip" style={{ cursor: "default", paddingRight: 6 }}>
                        {c.class_group}
                        <button type="button" onClick={() => removerTurma(c)} aria-label={`Remover a turma ${serie} ${c.class_group}`}
                          style={{ border: 0, background: "none", cursor: "pointer", color: "var(--tinta-3)", padding: "0 4px", font: "700 16px/1 var(--font-sans)" }}>×</button>
                      </span>
                    ))}
                  </li>
                ))}
              </ul>
            )}
            <AddClassForm
              years={years}
              activeYearId={activeYear.id}
              segmentoInicial={grades.find((g) => selectedGradeIds.includes(g.id))?.segment_id || "EFAI"}
              onSuccess={() => {
                loadClasses();
                loadGrades();
                setMessage({ type: "ok", text: "Turma adicionada." });
              }}
              onError={(e) => setMessage({ type: "err", text: e })}
            />
          </>
        )}
      </section>

      {/* 4. Como a escola trabalha */}
      <section className={secao} aria-labelledby="cfg-modo-t">
        <div>
          <h2 id="cfg-modo-t" style={titulo}>Como a escola trabalha</h2>
          <p className="omni-apoio" style={{ margin: 0 }}>Dá para trocar depois sem perder nada.</p>
        </div>
        <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
          <legend className="omni-campo__rotulo" style={{ marginBottom: 8 }}>Tamanho do fluxo de inclusão</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {([
              { id: "completo", titulo: "Completo", texto: "Estudo de caso, PEI em camadas (coordenação e cada professor), AEE e acompanhamento." },
              { id: "simplificado", titulo: "Simplificado", texto: "O essencial do PEI e do acompanhamento, pensado para a escola particular." },
            ] as const).map((op) => (
              <label key={op.id} className="omni-tema" style={{ flexDirection: "row", gap: 12, padding: "var(--space-4)" }}>
                <input type="radio" name="modo-escola" value={op.id} checked={modo === op.id} disabled={modoSaving}
                  onChange={() => salvarConfig({ modo: op.id }, `Modo ${op.titulo.toLowerCase()} ativado.`, setModoSaving, () => setModo(op.id))} />
                <span>
                  <span style={{ display: "block", font: "700 16px/22px var(--font-sans)" }}>{op.titulo}</span>
                  <span className="omni-apoio" style={{ fontWeight: 400 }}>{op.texto}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <div>
          <div className="omni-preferencia">
            <div className="omni-preferencia__texto">
              <div className="omni-preferencia__nome" id="cfg-familia">Área da família</div>
              <div className="omni-preferencia__ajuda">Responsáveis entram com login próprio e acompanham o PEI, a evolução e o PAEE do estudante.</div>
            </div>
            <input type="checkbox" role="switch" className="omni-interruptor" aria-labelledby="cfg-familia" checked={familyModuleEnabled} disabled={familyModuleSaving}
              onChange={(e) => { const v = e.target.checked; salvarConfig({ family_module_enabled: v }, v ? "Área da família ligada." : "Área da família desligada.", setFamilyModuleSaving, () => setFamilyModuleEnabled(v)); }} />
          </div>
          <div className="omni-preferencia" style={{ borderBottom: 0 }}>
            <div className="omni-preferencia__texto">
              <div className="omni-preferencia__nome" id="cfg-fase1">Avaliar antes de o PEI ir aos professores</div>
              <div className="omni-preferencia__ajuda">Professores já podem ver e avaliar o estudante enquanto o PEI ainda está com a coordenação.</div>
            </div>
            <input type="checkbox" role="switch" className="omni-interruptor" aria-labelledby="cfg-fase1" checked={allowAvaliacaoFase1} disabled={allowAvaliacaoFase1Saving}
              onChange={(e) => { const v = e.target.checked; salvarConfig({ allow_avaliacao_fase_1: v }, v ? "Avaliação antes do envio ligada." : "Avaliação antes do envio desligada.", setAllowAvaliacaoFase1Saving, () => setAllowAvaliacaoFase1(v)); }} />
          </div>
        </div>
      </section>

      {/* 5. Manutenção */}
      <details className="omni-cartao omni-cartao--plano">
        <summary style={{ cursor: "pointer", font: "700 16px/22px var(--font-sans)", color: "var(--tinta)" }}>
          Manutenção dos dados <span className="omni-apoio" style={{ fontWeight: 400 }}>· registros sem estudante ou com referências quebradas</span>
        </summary>
        <div style={{ marginTop: 12 }}><DataCleanupPanel /></div>
      </details>
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
    } catch { /* expected fallback */
      onError("Erro de conexão.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-3 items-end">
      <div className="omni-campo">
        <label className="omni-campo__rotulo" htmlFor="cfg-ano-num">Ano</label>
        <input
          type="number"
          min={2020}
          max={2030}
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          id="cfg-ano-num"
          className="omni-entrada"
          style={{ width: 110 }}
        />
      </div>
      <div className="omni-campo">
        <label className="omni-campo__rotulo" htmlFor="cfg-ano-nome">Nome <span className="omni-campo__opcional">(opcional)</span></label>
        <input
          type="text"
          placeholder="Ex: 2025"
          value={name}
          onChange={(e) => setName(e.target.value)}
          id="cfg-ano-nome"
          className="omni-entrada"
          style={{ width: 160 }}
        />
      </div>
      <button
        type="submit"
        disabled={saving}
        className="omni-btn omni-btn--secundario"
      >
        {saving ? "Adicionando…" : "Adicionar ano letivo"}
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
  gradeOptions: { id: string; _label: string; _seg: string }[];
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
      {Array.from(new Set(gradeOptions.map((g) => g._seg))).map((seg) => (
        <fieldset key={seg} className="omni-escolhas" style={{ marginBottom: "var(--space-3)" }}>
          <legend>{seg}</legend>
          {gradeOptions.filter((g) => g._seg === seg).map((g) => (
            <label key={g.id} className="omni-chip">
              <input type="checkbox" checked={selectedIds.includes(g.id)} onChange={() => toggle(g.id)} />
              {g._label}
            </label>
          ))}
        </fieldset>
      ))}
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
        className="omni-btn omni-btn--primario"
      >
        {saving ? "Salvando…" : "Salvar séries"}
      </button>
    </div>
  );
}

function AddClassForm({
  years,
  activeYearId,
  segmentoInicial,
  onSuccess,
  onError,
}: {
  years: SchoolYear[];
  activeYearId: string;
  /** a primeira etapa que a escola oferece (antes começava sempre em Anos Iniciais) */
  segmentoInicial: string;
  onSuccess: () => void;
  onError: (err: string) => void;
}) {
  const [segmentId, setSegmentId] = useState(segmentoInicial);
  useEffect(() => { setSegmentId(segmentoInicial); }, [segmentoInicial]);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    } catch { /* expected fallback */
      onError("Erro de conexão.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-3 items-end" style={{ paddingTop: 4 }}>
      <div className="omni-campo">
        <label className="omni-campo__rotulo" htmlFor="cfg-seg">Etapa</label>
        <select id="cfg-seg" className="omni-entrada" value={segmentId} onChange={(e) => setSegmentId(e.target.value)}>
          {SEGMENTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
      </div>
      {years.length > 1 && (
        <div className="omni-campo">
          <label className="omni-campo__rotulo" htmlFor="cfg-ano-turma">Ano letivo</label>
          <select id="cfg-ano-turma" className="omni-entrada" value={yearId} onChange={(e) => setYearId(e.target.value)}>
            {years.map((y) => <option key={y.id} value={y.id}>{y.year}</option>)}
          </select>
        </div>
      )}
      <div className="omni-campo">
        <label className="omni-campo__rotulo" htmlFor="cfg-serie">Série</label>
        <select id="cfg-serie" className="omni-entrada" value={gradeId} onChange={(e) => setGradeId(e.target.value)}>
          {gradesForWorkspace.length === 0 ? (
            <option value="">Marque as séries no passo 2</option>
          ) : (
            gradesForWorkspace.map((g) => <option key={g.id} value={g.id}>{g.label || g.code}</option>)
          )}
        </select>
      </div>
      <div className="omni-campo">
        <label className="omni-campo__rotulo" htmlFor="cfg-turma">Turma</label>
        <input id="cfg-turma" type="text" className="omni-entrada" style={{ width: 90 }} placeholder="A" value={classGroup} onChange={(e) => setClassGroup(e.target.value)} />
      </div>
      <button type="submit" disabled={saving || !gradeId} className="omni-btn omni-btn--primario">
        {saving ? "Adicionando…" : "Adicionar turma"}
      </button>
    </form>
  );
}
