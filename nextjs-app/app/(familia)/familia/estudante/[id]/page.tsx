"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, FileText, TrendingUp, Loader2, CheckCircle2, PenLine } from "lucide-react";

type EstudanteData = {
  estudante: { id: string; name: string; grade: string | null; class_group: string | null };
  pei_resumo: { nome?: string; serie?: string; turma?: string; ia_sugestao?: string | null } | null;
  paee_resumo: { periodo?: string | null; foco?: string } | null;
  evolucao: { evolucao: Array<{ disciplina: string; periodos: number; media_mais_recente: number | null }> };
  ciencia_pei: { acknowledged: boolean; acknowledged_at: string | null };
};

export default function FamiliaEstudantePage({ params }: { params: Promise<{ id: string }> }) {
  const [data, setData] = useState<EstudanteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [cienciaLoading, setCienciaLoading] = useState(false);

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
            <p className="text-sm text-slate-600 line-clamp-6">{pei_resumo.ia_sugestao}</p>
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
    </div>
  );
}
