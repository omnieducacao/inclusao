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
import { auditar } from "@/lib/audit";

/** SCRUM-70: telas cuja abertura de um estudante entra na trilha de auditoria. */
const MODULO_AUDITADO: Record<string, string> = { PEI: "pei", PAEE: "paee", "Diário": "diario", Monitoramento: "monitoramento" };

export async function getStudentsWithFallback(
  workspaceId: string | null | undefined,
  studentId: string | null | undefined,
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
  const recurso = MODULO_AUDITADO[moduleName];
  if (recurso) await auditar(session, undefined, { action: "view", resourceType: recurso, resourceId: studentId });
  return { students, student };
}
