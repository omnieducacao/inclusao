"use client";

import { useSearchParams } from "next/navigation";
import { StudentSelector } from "@/components/StudentSelector";

type Student = { id: string; name: string };

type Props = {
  students: Student[];
  studentId: string | null;
};

export function DiarioClient({ students, studentId }: Props) {
  const searchParams = useSearchParams();
  const currentId = studentId || searchParams.get("student");

  return (
    <div className="space-y-6">
      <StudentSelector students={students} currentId={currentId} placeholder="Selecione o estudante" />

      {currentId ? (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <p className="text-slate-600 mb-4">
            Registre as sessões de atendimento, evoluções e observações do estudante selecionado.
          </p>
          <p className="text-sm text-slate-500">
            Em breve: formulário de registro de sessão e histórico. Use o app Streamlit para essa funcionalidade.
          </p>
          <a href={`/pei?student=${currentId}`} className="inline-block mt-4 text-rose-600 hover:underline text-sm">
            Ver PEI do estudante →
          </a>
        </div>
      ) : (
        <div className="bg-amber-50 text-amber-800 p-4 rounded-lg">
          Selecione um estudante para registrar atendimentos.
        </div>
      )}
    </div>
  );
}
