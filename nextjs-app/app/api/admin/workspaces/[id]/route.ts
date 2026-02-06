import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";

async function checkAdmin() {
  const session = await getSession();
  if (!session?.is_platform_admin) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }
  return null;
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await checkAdmin();
  if (adminCheck) return adminCheck;

  const { id } = await params;
  const body = await req.json();

  try {
    const sb = getSupabase();
    const { data, error } = await sb
      .from("workspaces")
      .update({
        name: body.name,
        segments: body.segments,
        ai_engines: body.ai_engines,
        enabled_modules: body.enabled_modules,
        active: body.active,
        plan: body.plan,
        credits_limit: body.credits_limit,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ workspace: data });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao atualizar workspace." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await checkAdmin();
  if (adminCheck) return adminCheck;

  const { id } = await params;

  try {
    const sb = getSupabase();
    const { error } = await sb.from("workspaces").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao excluir workspace." },
      { status: 500 }
    );
  }
}
