"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, FileText, TrendingUp, Loader2, CheckCircle2, PenLine, Upload, Pill, ChevronDown, ChevronUp, Plus } from "lucide-react";

type EstudanteData = {
  estudante: { id: string; name: string; grade: string | null; class_group: string | null };
  pei_resumo: { nome?: string; serie?: string; turma?: string; ia_sugestao?: string | null } | null;
  paee_resumo: { periodo?: string | null; foco?: string } | null;
  evolucao: { evolucao: Array<{ disciplina: string; periodos: number; media_mais_recente: number | null }> };
  ciencia_pei: { acknowledged: boolean; acknowledged_at: string | null };
};

type Laudo = {
  id: string;
  transcricao: string;
  nome_arquivo: string | null;
  created_at: string;
};

type MedicacaoUpdate = {
  id: string;
  medicamento: string;
  dosagem: string | null;
  tipo_alteracao: string;
  observacao: string | null;
  created_at: string;
};

export default function FamiliaEstudantePage({ params }: { params: Promise<{ id: string }> }) {
  const [data, setData] = useState<EstudanteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [cienciaLoading, setCienciaLoading] = useState(false);

  // Laudos
  const [laudos, setLaudos] = useState<Laudo[]>([]);
  const [laudoUploading, setLaudoUploading] = useState(false);
  const [laudoExpandedId, setLaudoExpandedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Medicação
  const [medicacaoList, setMedicacaoList] = useState<MedicacaoUpdate[]>([]);
  const [showMedForm, setShowMedForm] = useState(false);
  const [medSaving, setMedSaving] = useState(false);
  const [medForm, setMedForm] = useState({ medicamento: "", dosagem: "", tipo_alteracao: "inicio", observacao: "" });

  useEffect(() => {
    params.then((p) => setStudentId(p.id));
  }, [params]);

  useEffect(() => {
    if (!studentId) return;
    setLoading(true);
    setError(null);
    fetch(`/api/familia/estudante/${studentId}`)
      .then(async (r) => {
        if (!r.ok) {
          const body = await r.json().catch(() => ({}));
          throw new Error(body.error || `Erro ${r.status}`);
        }
        return r.json();
      })
      .then(setData)
      .catch((err) => {
        setData(null);
        setError(err.message || "Erro ao carregar dados do estudante.");
      })
      .finally(() => setLoading(false));
  }, [studentId]);

  // Fetch laudos + medicação
  useEffect(() => {
    if (!studentId) return;
    fetch(`/api/familia/laudos?student_id=${studentId}`)
      .then((r) => r.json())
      .then((d) => setLaudos(d.laudos || []))
      .catch(() => { });
    fetch(`/api/familia/medicacao?student_id=${studentId}`)
      .then((r) => r.json())
      .then((d) => setMedicacaoList(d.registros || []))
      .catch(() => { });
  }, [studentId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 gap-2 text-slate-500">
        <Loader2 className="w-6 h-6 animate-spin" />
        Carregando...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center border border-slate-200 shadow-sm">
        <p className="text-red-600 font-medium">{error || "Não foi possível carregar os dados do estudante."}</p>
        <p className="text-sm text-slate-500 mt-2">Verifique se o estudante está vinculado à sua conta.</p>
        <div className="mt-4 flex gap-3 justify-center">
          <button
            onClick={() => studentId && window.location.reload()}
            className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700"
          >
            Tentar novamente
          </button>
          <Link
            href="/familia"
            className="px-4 py-2 border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50"
          >
            Voltar
          </Link>
        </div>
      </div>
    );
  }

  const { estudante, pei_resumo, paee_resumo, evolucao, ciencia_pei = { acknowledged: false, acknowledged_at: null } } = data;

  async function registrarCiencia() {
    if (!studentId || cienciaLoading) return;
    setCienciaLoading(true);
    try {
      const res = await fetch("/api/familia/ciencia-pei", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: studentId }),
      });
      const json = await res.json();
      if (res.ok && json.acknowledged) {
        setData((prev) =>
          prev
            ? {
              ...prev,
              ciencia_pei: { acknowledged: true, acknowledged_at: new Date().toISOString() },
            }
            : prev
        );
      } else if (!res.ok) {
        alert(json.error || "Erro ao registrar ciência.");
      }
    } catch {
      alert("Erro ao registrar ciência. Tente novamente.");
    } finally {
      setCienciaLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <Link
        href="/familia"
        className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar aos meus estudantes
      </Link>

      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
          <span className="text-2xl font-bold text-emerald-700">
            {estudante.name?.[0]?.toUpperCase() || "?"}
          </span>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{estudante.name}</h1>
          <p className="text-slate-600 mt-1">
            {estudante.grade || "—"} {estudante.class_group ? `• Turma ${estudante.class_group}` : ""}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PEI Resumo + Ciência */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-3">
            <FileText className="w-5 h-5 text-blue-600" />
            Resumo do PEI
          </h3>
          {pei_resumo?.ia_sugestao ? (
            <div className="text-sm text-slate-600 whitespace-pre-wrap max-h-[600px] overflow-y-auto">{pei_resumo.ia_sugestao}</div>
          ) : (
            <p className="text-sm text-slate-500">PEI em elaboração ou sem resumo disponível.</p>
          )}
          {pei_resumo?.ia_sugestao && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              {(ciencia_pei?.acknowledged ?? false) ? (
                <div className="flex items-center gap-2 text-emerald-600 text-sm">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>
                    Ciência registrada em{" "}
                    {ciencia_pei.acknowledged_at
                      ? new Date(ciencia_pei.acknowledged_at).toLocaleDateString("pt-BR")
                      : ""}
                  </span>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-slate-600">
                    Li e tomei ciência do PEI do(a) estudante. Ao confirmar, registro minha ciência conforme a LBI.
                  </p>
                  <button
                    type="button"
                    onClick={registrarCiencia}
                    disabled={cienciaLoading}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-60"
                  >
                    {cienciaLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <PenLine className="w-4 h-4" />
                    )}
                    Registrar minha ciência do PEI
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Evolução Processual */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            Evolução (escala 0–4)
          </h3>
          {evolucao?.evolucao?.length > 0 ? (
            <div className="space-y-2">
              {evolucao.evolucao.map((e) => (
                <div
                  key={e.disciplina}
                  className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0"
                >
                  <span className="text-sm font-medium text-slate-700">{e.disciplina}</span>
                  <span className="text-sm text-slate-600">
                    {e.media_mais_recente != null ? `Média: ${e.media_mais_recente}` : "—"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">Nenhum registro de avaliação processual neste ano.</p>
          )}
        </div>
      </div>

      {paee_resumo && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200">
          <h3 className="font-semibold text-slate-800 mb-2">PAEE (Plano de Ação)</h3>
          <p className="text-sm text-slate-600">
            {paee_resumo.periodo && `Período: ${paee_resumo.periodo}`}
            {paee_resumo.foco && ` • Foco: ${paee_resumo.foco}`}
          </p>
        </div>
      )}

      {/* ── Laudos ── */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-amber-600" />
          Laudos e Relatórios
        </h3>

        {/* Upload */}
        <div className="mb-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file || !studentId) return;
              setLaudoUploading(true);
              try {
                const fd = new FormData();
                fd.append("file", file);
                fd.append("student_id", studentId);
                const res = await fetch("/api/familia/laudos", { method: "POST", body: fd });
                const json = await res.json();
                if (res.ok && json.laudo) {
                  setLaudos((prev) => [json.laudo, ...prev]);
                } else {
                  alert(json.error || "Erro ao enviar laudo.");
                }
              } catch {
                alert("Erro ao enviar laudo.");
              } finally {
                setLaudoUploading(false);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }
            }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={laudoUploading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 disabled:opacity-60"
          >
            {laudoUploading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Transcrevendo...</>
            ) : (
              <><Upload className="w-4 h-4" /> Enviar laudo (PDF ou imagem)</>
            )}
          </button>
          <p className="text-xs text-slate-500 mt-1">O documento será transcrito automaticamente por IA.</p>
        </div>

        {/* Lista de laudos */}
        {laudos.length === 0 ? (
          <p className="text-sm text-slate-500">Nenhum laudo enviado.</p>
        ) : (
          <div className="space-y-2">
            {laudos.map((l) => {
              const isExpanded = laudoExpandedId === l.id;
              return (
                <div key={l.id} className="border border-slate-200 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setLaudoExpandedId(isExpanded ? null : l.id)}
                    className="w-full flex items-center justify-between p-3 text-left hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="w-4 h-4 text-amber-600" />
                      <span className="font-medium text-slate-700">{l.nome_arquivo || "Laudo"}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-500">{new Date(l.created_at).toLocaleDateString("pt-BR")}</span>
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </button>
                  {isExpanded && (
                    <div className="px-3 pb-3 border-t border-slate-100">
                      <div className="text-sm text-slate-600 whitespace-pre-wrap mt-2 max-h-[400px] overflow-y-auto">
                        {l.transcricao}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Medicação ── */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <Pill className="w-5 h-5 text-violet-600" />
            Medicação
          </h3>
          <button
            onClick={() => setShowMedForm(!showMedForm)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-violet-600 hover:bg-violet-50 rounded-lg border border-violet-200"
          >
            <Plus className="w-4 h-4" />
            Registrar alteração
          </button>
        </div>

        {/* Formulário */}
        {showMedForm && (
          <div className="mb-4 p-4 bg-violet-50 border border-violet-200 rounded-lg space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Medicamento *</label>
                <input
                  type="text"
                  value={medForm.medicamento}
                  onChange={(e) => setMedForm({ ...medForm, medicamento: e.target.value })}
                  placeholder="Nome do medicamento"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Dosagem</label>
                <input
                  type="text"
                  value={medForm.dosagem}
                  onChange={(e) => setMedForm({ ...medForm, dosagem: e.target.value })}
                  placeholder="Ex: 10mg 2x ao dia"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Tipo de alteração *</label>
              <select
                value={medForm.tipo_alteracao}
                onChange={(e) => setMedForm({ ...medForm, tipo_alteracao: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
              >
                <option value="inicio">🟢 Início de medicação</option>
                <option value="mudanca_dose">🔄 Mudança de dose</option>
                <option value="suspensao">🔴 Suspensão</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Observação</label>
              <textarea
                value={medForm.observacao}
                onChange={(e) => setMedForm({ ...medForm, observacao: e.target.value })}
                placeholder="Orientação do médico, motivo da alteração..."
                rows={2}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  if (!medForm.medicamento.trim() || !studentId) {
                    alert("Medicamento é obrigatório.");
                    return;
                  }
                  setMedSaving(true);
                  try {
                    const res = await fetch("/api/familia/medicacao", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ student_id: studentId, ...medForm }),
                    });
                    const json = await res.json();
                    if (res.ok && json.registro) {
                      setMedicacaoList((prev) => [json.registro, ...prev]);
                      setMedForm({ medicamento: "", dosagem: "", tipo_alteracao: "inicio", observacao: "" });
                      setShowMedForm(false);
                    } else {
                      alert(json.error || "Erro ao salvar.");
                    }
                  } catch {
                    alert("Erro ao salvar.");
                  } finally {
                    setMedSaving(false);
                  }
                }}
                disabled={medSaving}
                className="px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 disabled:opacity-60"
              >
                {medSaving ? "Salvando..." : "Salvar"}
              </button>
              <button
                onClick={() => setShowMedForm(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Histórico */}
        {medicacaoList.length === 0 ? (
          <p className="text-sm text-slate-500">Nenhuma alteração de medicação registrada.</p>
        ) : (
          <div className="space-y-2">
            {medicacaoList.map((m) => {
              const tipoLabel = m.tipo_alteracao === "inicio" ? "🟢 Início" : m.tipo_alteracao === "suspensao" ? "🔴 Suspensão" : "🔄 Mudança de dose";
              return (
                <div key={m.id} className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-slate-800">{m.medicamento}</span>
                      {m.dosagem && <span className="text-xs text-slate-500">({m.dosagem})</span>}
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{tipoLabel}</span>
                    </div>
                    {m.observacao && <p className="text-xs text-slate-600 mt-1">{m.observacao}</p>}
                    <p className="text-xs text-slate-400 mt-1">{new Date(m.created_at).toLocaleDateString("pt-BR")}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
