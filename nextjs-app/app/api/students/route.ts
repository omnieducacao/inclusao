import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { listStudents } from "@/lib/students";

export async function GET() {
  const session = await getSession();
  if (!session?.workspace_id) {
    return NextResponse.json(
      { error: "Não autenticado ou sem workspace." },
      { status: 401 }
    );
  }

  try {
    const students = await listStudents(session.workspace_id);
    return NextResponse.json(students);
  } catch (err) {
    console.error("GET /api/students:", err);
    return NextResponse.json(
      { error: "Erro ao carregar estudantes." },
      { status: 500 }
    );
  }
}
