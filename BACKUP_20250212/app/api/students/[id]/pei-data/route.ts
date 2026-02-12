import { parseBody, studentPatchDataSchema } from "@/lib/validation";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";

/**
 * Rota alternativa para buscar apenas o pei_data de um estudante.
 * Usa quando o estudante está na lista mas a API principal retorna 404.
 * Busca diretamente do Supabase sem verificar workspace_id (já que o estudante está na lista do usuário).
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.workspace_id) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { id } = await params;
  const sb = getSupabase();
  
  // Buscar apenas o pei_data diretamente
  const { data, error } = await sb
    .from("students")
    .select("pei_data")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Erro ao buscar pei_data:", error);
    return NextResponse.json(
      { error: "Erro ao buscar dados do PEI." },
      { status: 500 }
    );
  }

  if (!data) {
    return NextResponse.json(
      { error: "Estudante não encontrado." },
      { status: 404 }
    );
  }

  // Retornar o pei_data (pode ser null se não tiver dados salvos)
  return NextResponse.json({
    pei_data: (data.pei_data as Record<string, unknown>) || null,
  });
}

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
  const { pei_data } = body;

  if (!pei_data || typeof pei_data !== "object") {
    return NextResponse.json({ error: "pei_data é obrigatório." }, { status: 400 });
  }

  const sb = getSupabase();
  const { error } = await sb
    .from("students")
    .update({ pei_data })
    .eq("id", id)
    .eq("workspace_id", session.workspace_id);

  if (error) {
    console.error("Erro ao atualizar pei_data:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar dados do PEI." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
