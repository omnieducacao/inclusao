import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";

/**
 * GET /api/workspace/config
 * Retorna configurações do workspace (family_module_enabled, etc.).
 */
export async function GET() {
  const session = await getSession();
  if (!session?.workspace_id || session.user_role === "family") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const member = session.member as Record<string, unknown> | undefined;
  const canGestao = session.user_role === "master" || member?.can_gestao;
  if (!canGestao) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const sb = getSupabase();
  const { data, error } = await sb
    .from("workspaces")
    .select("family_module_enabled, allow_avaliacao_fase_1")
    .eq("id", session.workspace_id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const d = data as { family_module_enabled?: boolean; allow_avaliacao_fase_1?: boolean } | null;
  return NextResponse.json({
    family_module_enabled: Boolean(d?.family_module_enabled),
    allow_avaliacao_fase_1: Boolean(d?.allow_avaliacao_fase_1),
  });
}

/**
 * PATCH /api/workspace/config
 * Atualiza configurações do workspace.
 * Body: { family_module_enabled?: boolean }
 */
export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session?.workspace_id || session.user_role === "family") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const member = session.member as Record<string, unknown> | undefined;
  const canGestao = session.user_role === "master" || member?.can_gestao;
  if (!canGestao) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  let body: { family_module_enabled?: boolean; allow_avaliacao_fase_1?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (typeof body.family_module_enabled === "boolean") {
    updates.family_module_enabled = body.family_module_enabled;
  }
  if (typeof body.allow_avaliacao_fase_1 === "boolean") {
    updates.allow_avaliacao_fase_1 = body.allow_avaliacao_fase_1;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nenhuma alteração enviada" }, { status: 400 });
  }

  const sb = getSupabase();
  const { error } = await sb
    .from("workspaces")
    .update(updates)
    .eq("id", session.workspace_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
