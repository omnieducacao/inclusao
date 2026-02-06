"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { StudentSelector } from "@/components/StudentSelector";

type Student = { id: string; name: string };
type StudentFull = Student & {
  grade?: string | null;
  diagnosis?: string | null;
  pei_data?: Record<string, unknown>;
  paee_ciclos?: unknown[];
  planejamento_ativo?: string | null;
};

type Props = {
  students: Student[];
  studentId: string | null;
  student: StudentFull | null;
};

export function MonitoramentoClient({ students, studentId, student }: Props) {
  const searchParams = useSearchParams();
  const currentId = studentId || searchParams.get("student");

  const peiData = student?.pei_data || {};
  const ciclos = (student?.paee_ciclos || []) as { ciclo_id?: string; config_ciclo?: { foco_principal?: string }; status?: string }[];
  const nCiclos = ciclos.length;
  const nPotencias = (peiData.potencias as string[])?.length || 0;
  const nBarreiras = Object.values(peiData.barreiras_selecionadas as Record<string, string[]> || {}).reduce(
    (a, v) => a + (v?.length || 0),
    0
  );

  return (
    <div className="space-y-6">
      <StudentSelector students={students} currentId={currentId} placeholder="Selecione o estudante" />

      {!currentId && (
        <div className="bg-amber-50 text-amber-800 p-4 rounded-lg">
          Selecione um estudante para ver o consolidado de dados.
        </div>
      )}

      {currentId && student && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-white">
              <div className="text-2xl font-bold text-slate-800">{nPotencias}</div>
              <div className="text-xs text-slate-500 uppercase tracking-wide">Potencialidades</div>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-white">
              <div className="text-2xl font-bold text-slate-800">{nBarreiras}</div>
              <div className="text-xs text-slate-500 uppercase tracking-wide">Barreiras</div>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-white">
              <div className="text-2xl font-bold text-slate-800">{nCiclos}</div>
              <div className="text-xs text-slate-500 uppercase tracking-wide">Ciclos PAEE</div>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-white">
              <div className="text-lg font-bold text-slate-800 truncate" title={String(peiData.hiperfoco)}>
                {String(peiData.hiperfoco || "—")}
              </div>
              <div className="text-xs text-slate-500 uppercase tracking-wide">Hiperfoco</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href={`/pei?student=${student.id}`}
              className="px-4 py-2 bg-sky-600 text-white rounded-lg text-sm hover:bg-sky-700"
            >
              Ver PEI
            </Link>
            <Link
              href={`/paee?student=${student.id}`}
              className="px-4 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50"
            >
              Ver PAEE
            </Link>
          </div>

          {nCiclos > 0 && (
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div className="font-medium text-slate-700 mb-2">Ciclos PAEE recentes</div>
              <ul className="space-y-1 text-sm text-slate-600">
                {ciclos.slice(0, 5).map((c) => (
                  <li key={c.ciclo_id}>
                    • {c.config_ciclo?.foco_principal || "Ciclo"} — {c.status || "rascunho"}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
