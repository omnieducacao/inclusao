import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";

/**
 * GET /api/familia/responsaveis?studentId=xxx
 * Lista responsáveis do workspace (ou vinculados ao estudante).
 * Apenas staff (master/member com can_estudantes ou can_gestao).
 */
export async function GET(req: Request) {
  const session = await getSession();
  if (!session?.workspace_id || session.user_role === "family") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("studentId");

  const sb = getSupabase();

  let query = sb
    .from("family_responsibles")
    .select("id, nome, email, telefone, parentesco, active, created_at")
    .eq("workspace_id", session.workspace_id)
    .order("nome");

  const { data: responsaveis, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!studentId) {
    return NextResponse.json({ responsaveis: responsaveis || [] });
  }

  const { data: links } = await sb
    .from("family_student_links")
    .select("family_responsible_id")
    .eq("student_id", studentId);

  const linkedIds = new Set((links || []).map((l) => l.family_responsible_id));

  return NextResponse.json({
    responsaveis: (responsaveis || []).map((r) => ({
      ...r,
      vinculado: linkedIds.has(r.id),
    })),
  });
}

/**
 * POST /api/familia/responsaveis
 * Cria responsável e opcionalmente vincula a estudante(s).
 * Body: { nome, email, telefone?, parentesco?, senha, studentIds?: string[] }
 */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.workspace_id || session.user_role === "family") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const member = session.member as Record<string, unknown> | undefined;
  const canGestao = session.user_role === "master" || member?.can_gestao || member?.can_estudantes;
  if (!canGestao) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  let body: { nome: string; email: string; telefone?: string; parentesco?: string; senha: string; studentIds?: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const { nome, email, telefone, parentesco, senha, studentIds } = body;
  if (!nome?.trim() || !email?.trim() || !senha?.trim()) {
    return NextResponse.json({ error: "Nome, e-mail e senha são obrigatórios" }, { status: 400 });
  }

  const emailVal = email.trim().toLowerCase();
  const sb = getSupabase();

  const { data: ws } = await sb.from("workspaces").select("family_module_enabled").eq("id", session.workspace_id).single();
  if (!ws?.family_module_enabled) {
    return NextResponse.json({ error: "Módulo Família não está habilitado para esta escola" }, { status: 400 });
  }

  const passwordHash = bcrypt.hashSync(senha, 10);

  const { data: created, error: insertError } = await sb
    .from("family_responsibles")
    .insert({
      workspace_id: session.workspace_id,
      nome: nome.trim(),
      email: emailVal,
      telefone: telefone?.trim() || null,
      parentesco: parentesco?.trim() || null,
      password_hash: passwordHash,
      active: true,
      terms_accepted: false,
    })
    .select("id, nome, email, created_at")
    .single();

  if (insertError) {
    if (insertError.code === "23505") {
      return NextResponse.json({ error: "Já existe um responsável com este e-mail" }, { status: 409 });
    }
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  const ids = Array.isArray(studentIds) ? studentIds.filter(Boolean) : [];
  if (ids.length > 0 && created) {
    await sb.from("family_student_links").insert(
      ids.map((student_id) => ({
        family_responsible_id: created.id,
        student_id,
      }))
    );
  }

  return NextResponse.json({ responsavel: created });
}
