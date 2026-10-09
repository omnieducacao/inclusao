import { getSession } from "@/lib/session";
import { listStudentsDaSessao } from "@/lib/students";
import { turmasDaEscola } from "@/lib/turmas";
import { situacaoDoPei, hojeBrasilia } from "@/lib/inicio";
import { PageHero } from "@/components/PageHero";
import { SafeModuleWrapper } from "@/components/SafeModuleWrapper";
import { EstudantesClient, type LinhaEstudante } from "./EstudantesClient";

export default async function EstudantesPage() {
  const session = await getSession();
  const workspaceId = session?.workspace_id;
  const students = await listStudentsDaSessao(session);
  const hoje = hojeBrasilia();

  const member = (session?.member || {}) as Record<string, boolean>;
  const podeCriar = Boolean(session?.is_platform_admin || session?.user_role === "master" || member.can_estudantes);
  const turmas = workspaceId && podeCriar ? await turmasDaEscola(workspaceId) : [];

  // Só a situação vai para o navegador: o PEI inteiro (com dados sensíveis) fica no servidor
  const linhas: LinhaEstudante[] = students.map((s) => {
    const ciclos = (s.paee_ciclos || []) as Array<{ status?: string }>;
    return {
      id: s.id,
      name: s.name,
      grade: s.grade,
      class_group: s.class_group,
      pei: situacaoDoPei(s.pei_data, hoje),
      paee: ciclos.some((c) => c.status === "ativo") ? "ativo" : ciclos.length ? "sem_ativo" : "nenhum",
    };
  });

  return (
    <div className="space-y-6">
      <PageHero
        moduleKey="omnisfera"
        title="Estudantes"
        desc="Em que pé está o PEI e o PAEE de cada estudante. Abra a ficha para ver tudo sobre ele."
      />
      <SafeModuleWrapper fallbackTitle="Estudantes">
        <EstudantesClient
          students={linhas}
          podeCriar={podeCriar}
          turmas={turmas
            .map((t) => ({ id: t.id, grade: t.grade?.label || "", class_group: t.class_group || "" }))
            .sort((a, b) => (a.grade + a.class_group).localeCompare(b.grade + b.class_group, "pt-BR", { numeric: true }))}
        />
      </SafeModuleWrapper>
    </div>
  );
}
