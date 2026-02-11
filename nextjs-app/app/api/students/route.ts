import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { listStudents } from "@/lib/students";
import { getSupabase } from "@/lib/supabase";
import { requirePermission } from "@/lib/permissions";

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

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.workspace_id) {
    return NextResponse.json(
      { error: "Não autenticado ou sem workspace." },
      { status: 401 }
    );
  }

  // Permission check: members need can_estudantes
  const denied = requirePermission(session, "can_estudantes");
  if (denied) return denied;

  try {
    const body = await req.json();
    const { name, grade, class_group, diagnosis, pei_data } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Nome do estudante é obrigatório." },
        { status: 400 }
      );
    }

    const sb = getSupabase();
    const { data, error } = await sb
      .from("students")
      .insert({
        workspace_id: session.workspace_id,
        name: name.trim(),
        grade: grade || null,
        class_group: class_group || null,
        diagnosis: diagnosis || null,
        pei_data: pei_data || null,
      })
      .select("id, workspace_id, name, grade, class_group, diagnosis, pei_data, created_at")
      .single();

    if (error) {
      console.error("Erro ao criar estudante:", error);
      return NextResponse.json(
        { error: error.message || "Erro ao criar estudante." },
        { status: 500 }
      );
    }

    return NextResponse.json({ student: data });
  } catch (err) {
    console.error("POST /api/students:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao criar estudante." },
      { status: 500 }
    );
  }
}
