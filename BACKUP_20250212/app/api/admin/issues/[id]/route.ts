import { parseBody, adminIssuePatchSchema } from "@/lib/validation";
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
    const parsed = await parseBody(req, adminIssuePatchSchema);
    if (parsed.error) return parsed.error;
    const body = parsed.data;
    const updates: Record<string, unknown> = {};

    if (body.status !== undefined) {
      updates.status = body.status;
      if (body.status === "resolvido" || body.status === "arquivado") {
        updates.resolved_at = new Date().toISOString();
      }
    }
    if (body.resolution_notes !== undefined) {
      updates.resolution_notes = String(body.resolution_notes).trim();
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "Nenhum campo para atualizar." }, { status: 400 });
    }

    const sb = getSupabase();
    const { data, error } = await sb
      .from("platform_issues")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Erro ao atualizar issue:", error);
      return NextResponse.json({ error: error.message || "Erro ao atualizar bug." }, { status: 500 });
    }

    return NextResponse.json({ issue: data });
  } catch (err) {
    console.error("PATCH /api/admin/issues/[id]:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao atualizar bug." },
      { status: 500 }
    );
  }
}
