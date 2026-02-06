import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { listStudents, createStudent } from "@/lib/students";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session?.workspace_id) {
    return NextResponse.json(
      { error: "Não autenticado ou sem workspace." },
      { status: 401 }
    );
  }

  try {
    // Aplicar filtros baseados no vínculo do professor
    const filters: {
      link_type?: "todos" | "turma" | "tutor";
      member_id?: string;
      component_id?: string;
    } = {};

    // Se é membro (não master), aplicar filtros de vínculo
    if (session.user_role === "member" && session.member) {
      const member = session.member as {
        id?: string;
        link_type?: "todos" | "turma" | "tutor";
      };
      filters.link_type = member.link_type || "todos";
      filters.member_id = member.id;
      
      // Se há filtro por disciplina na query string (ex: ?component_id=Matemática)
      const url = new URL(req.url);
      const componentId = url.searchParams.get("component_id");
      if (componentId) {
        filters.component_id = componentId;
      }
    }

    const students = await listStudents(session.workspace_id, filters);
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

  try {
    const body = await req.json();
    const { name, grade, class_group, diagnosis, birth_date, pei_data } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Nome do estudante é obrigatório." },
        { status: 400 }
      );
    }

    const student = await createStudent(session.workspace_id, {
      name: name.trim(),
      grade: grade || null,
      class_group: class_group || null,
      diagnosis: diagnosis || null,
      birth_date: birth_date || null,
      pei_data: pei_data || {},
    });

    if (!student) {
      return NextResponse.json(
        { error: "Erro ao criar estudante." },
        { status: 500 }
      );
    }

    return NextResponse.json({ student });
  } catch (err) {
    console.error("POST /api/students:", err);
    return NextResponse.json(
      { error: "Erro ao criar estudante." },
      { status: 500 }
    );
  }
}
