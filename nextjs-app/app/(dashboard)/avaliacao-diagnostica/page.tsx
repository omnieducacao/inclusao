import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { listStudentsDaSessao } from "@/lib/students";
import { CabecalhoAvaliacao } from "@/components/avaliacao/CabecalhoAvaliacao";
import DiagnosticaOmni from "./DiagnosticaOmni";

/**
 * Onda 17: a diagnóstica com a Matriz Omni (EF) e a do ENEM (EM).
 * A tela antiga (AvaliacaoDiagnosticaClient, que puxava a BNCC inteira) sai na onda 20,
 * depois do confronto de qualidade entre as matrizes.
 */
type Props = { searchParams: Promise<{ student?: string; studentId?: string; disciplina?: string }> };

export default async function AvaliacaoDiagnosticaPage({ searchParams }: Props) {
  const session = await getSession();
  if (!session?.workspace_id) redirect("/login");
  const p = await searchParams;
  const estudantes = (await listStudentsDaSessao(session).catch(() => []))
    .map((s) => ({ id: s.id, name: s.name, grade: s.grade || null, class_group: s.class_group || null }))
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  return (
    <div className="space-y-6">
      <CabecalhoAvaliacao atual="diagnostica" />
      <DiagnosticaOmni
        estudantes={estudantes}
        inicial={{ student: p.student || p.studentId || null, disciplina: p.disciplina || null }}
        podeConfrontar={!!(session.is_platform_admin || session.user_role === "master")}
      />
    </div>
  );
}
