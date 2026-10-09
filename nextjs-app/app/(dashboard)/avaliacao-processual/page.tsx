import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { listStudentsDaSessao } from "@/lib/students";
import { CabecalhoAvaliacao } from "@/components/avaliacao/CabecalhoAvaliacao";
import ProcessualOmni from "./ProcessualOmni";

/** Onda 17: a processual reabre os descritores da diagnóstica (a tela antiga sai na onda 20). */
type Props = { searchParams: Promise<{ student?: string; studentId?: string; disciplina?: string }> };

export default async function AvaliacaoProcessualPage({ searchParams }: Props) {
  const session = await getSession();
  if (!session?.workspace_id) redirect("/login");
  const p = await searchParams;
  const estudantes = (await listStudentsDaSessao(session).catch(() => []))
    .map((s) => ({ id: s.id, name: s.name, grade: s.grade || null }))
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  return (
    <div className="space-y-6">
      <CabecalhoAvaliacao atual="processual" />
      <ProcessualOmni estudantes={estudantes} inicial={{ student: p.student || p.studentId || null, disciplina: p.disciplina || null }} />
    </div>
  );
}
