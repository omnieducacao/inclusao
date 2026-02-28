import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";

/**
 * POST /api/familia/ciencia-pei
 * Registra a ciência do PEI pela família (responsável legal).
 * Body: { student_id: string }
 */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.workspace_id || session.user_role !== "family") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const familyId = session.family_responsible_id;
  if (!familyId) {
    return NextResponse.json({ error: "Sessão inválida" }, { status: 401 });
  }

  let body: { student_id?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
  }

  const studentId = body.student_id?.trim();
  if (!studentId) {
    return NextResponse.json({ error: "student_id é obrigatório" }, { status: 400 });
  }

  const sb = getSupabase();

  const { data: link } = await sb
    .from("family_student_links")
    .select("id")
    .eq("family_responsible_id", familyId)
    .eq("student_id", studentId)
    .maybeSingle();

  if (!link) {
    return NextResponse.json({ error: "Estudante não vinculado a este responsável" }, { status: 403 });
  }

  const { data: existing } = await sb
    .from("family_pei_acknowledgments")
    .select("id")
    .eq("family_responsible_id", familyId)
    .eq("student_id", studentId)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { message: "Ciência já registrada anteriormente", acknowledged: true },
      { status: 200 }
    );
  }

  const headers = req.headers;
  const forwarded = headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : null;
  const userAgent = headers.get("user-agent") || null;

  const { error } = await sb.from("family_pei_acknowledgments").insert({
    family_responsible_id: familyId,
    student_id: studentId,
    ip_address: ip,
    user_agent: userAgent,
  });

  if (error) {
    console.error("[ciencia-pei] Erro ao inserir:", error);
    return NextResponse.json({ error: "Erro ao registrar ciência" }, { status: 500 });
  }

  return NextResponse.json({ message: "Ciência do PEI registrada com sucesso", acknowledged: true });
}
