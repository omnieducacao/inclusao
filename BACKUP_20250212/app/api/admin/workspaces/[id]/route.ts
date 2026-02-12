import { parseBody, adminWorkspacePatchSchema } from "@/lib/validation";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session?.is_platform_admin) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "ID obrigatório." }, { status: 400 });
  }

  try {
    const parsed = await parseBody(req, adminWorkspacePatchSchema);
    if (parsed.error) return parsed.error;
    const body = parsed.data;
    const updates: Record<string, unknown> = {};

    if (body.name !== undefined) updates.name = String(body.name).trim();
    if (body.segments !== undefined) updates.segments = body.segments;
    if (body.ai_engines !== undefined) updates.ai_engines = body.ai_engines;
    if (body.enabled_modules !== undefined) updates.enabled_modules = body.enabled_modules;
    if (body.active !== undefined) updates.active = Boolean(body.active);
    if (body.plan !== undefined) updates.plan = String(body.plan).trim() || "basic";
    if (body.credits_limit !== undefined) {
      const cl = Number(body.credits_limit);
      updates.credits_limit = cl >= 0 ? cl : null;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "Nenhum campo para atualizar." }, { status: 400 });
    }

    const sb = getSupabase();
    const { data, error } = await sb
      .from("workspaces")
      .update(updates)
      .eq("id", id)
      .select("id, name, pin, segments, ai_engines, enabled_modules, active, plan, credits_limit, created_at")
      .single();

    if (error) {
      console.error("Erro ao atualizar workspace:", error);
      return NextResponse.json({ error: error.message || "Erro ao atualizar escola." }, { status: 500 });
    }

    return NextResponse.json({ workspace: data });
  } catch (err) {
    console.error("PATCH /api/admin/workspaces/[id]:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao atualizar escola." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session?.is_platform_admin) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "ID obrigatório." }, { status: 400 });
  }

  try {
    const sb = getSupabase();
    const { error } = await sb.from("workspaces").delete().eq("id", id);

    if (error) {
      console.error("Erro ao excluir workspace:", error);
      return NextResponse.json({ error: error.message || "Erro ao excluir escola." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/admin/workspaces/[id]:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao excluir escola." },
      { status: 500 }
    );
  }
}
