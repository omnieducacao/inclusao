import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { listStudents } from "@/lib/students";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session?.workspace_id) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  try {
    const students = await listStudents(session.workspace_id);
    const allLogs: Array<Record<string, unknown> & { student_id: string; student_name?: string }> = [];

    for (const student of students) {
      const logs = (student.daily_logs || []) as Array<Record<string, unknown>>;
      for (const log of logs) {
        allLogs.push({
          ...log,
          student_id: student.id,
          student_name: student.name,
        });
      }
    }

    return NextResponse.json({ registros: allLogs });
  } catch (err) {
    console.error("Erro ao buscar registros:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao buscar registros." },
      { status: 500 }
    );
  }
}
