import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";

/**
 * GET /api/students/[id]/versao
 * Devolve só a data da última alteração do estudante (updated_at), filtrando pela escola da sessão.
 * Usado pelo hook useStudentRealtime para saber se outra pessoa salvou algo (onda 0:
 * substitui o realtime do Supabase, que exigia o banco aberto para a chave pública).
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
  const { data } = await getSupabase()
    .from("students")
    .select("updated_at")
    .eq("id", id)
    .eq("workspace_id", session.workspace_id)
    .maybeSingle();

  if (!data) return NextResponse.json({ error: "Estudante não encontrado." }, { status: 404 });

  return NextResponse.json(
    { updated_at: (data as { updated_at: string | null }).updated_at },
    { headers: { "Cache-Control": "no-store" } }
  );
}
