/**
 * Omnisfera — carrega a lista de estudantes da tela e o estudante aberto.
 *
 * Onda 1: a lista respeita o vínculo de quem está logado (coordenação vê todos; professor vê
 * as suas turmas ou os seus estudantes), e um estudante fora do vínculo não abre pelo endereço.
 * O antigo "plano B" (buscar sem filtro quando a busca principal falhava) saiu: a falha vinha
 * da coluna paee_data, que faltava no banco e foi criada na migração da onda 1.
 */
import { getStudent, type Student } from "@/lib/students";
import { getSession } from "@/lib/session";
import { vinculoDaSessao, filtrarPorVinculo, vinculoInclui } from "@/lib/turmas";
import { listStudents } from "@/lib/students";

export async function getStudentsWithFallback(
  workspaceId: string | null | undefined,
  studentId: string | null | undefined,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  moduleName: string = "Module"
): Promise<{
  students: Student[];
  student: Student | null;
}> {
  if (!workspaceId) {
    return { students: [], student: null };
  }

  const session = await getSession();
  const [todos, vinculo] = await Promise.all([listStudents(workspaceId), vinculoDaSessao(session)]);
  const students = filtrarPorVinculo(vinculo, todos);

  if (!studentId) {
    return { students, student: null };
  }

  const student = await getStudent(workspaceId, studentId);
  if (!student || !vinculoInclui(vinculo, student)) {
    return { students, student: null };
  }
  return { students, student };
}
