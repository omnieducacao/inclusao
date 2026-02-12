import { parseBody, studentPatchDataSchema } from "@/lib/validation";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.workspace_id) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { id } = await params;
  const parsed = await parseBody(req, studentPatchDataSchema);

  if (parsed.error) return parsed.error;

  const body = parsed.data;
  const { paee_ciclos } = body;

  if (!Array.isArray(paee_ciclos)) {
    return NextResponse.json({ error: "paee_ciclos deve ser um array." }, { status: 400 });
  }

  const sb = getSupabase();
  const { error } = await sb
    .from("students")
    .update({ paee_ciclos })
    .eq("id", id)
    .eq("workspace_id", session.workspace_id);

  if (error) {
    console.error("Erro ao atualizar paee_ciclos:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar ciclos PAEE." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
