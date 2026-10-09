import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";
import { negadoForaDoVinculo } from "@/lib/turmas";

/** GET /api/hub/historico/[id] (onda 3) — o texto de um material do histórico do estudante. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  const workspaceId = session?.simulating_workspace_id || session?.workspace_id;
  if (!session || !workspaceId || session.user_role === "family") {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  const { id } = await params;
  const { data } = await getSupabase()
    .from("hub_generated_content")
    .select("id, student_id, content_type, description, metadata, created_at")
    .eq("id", id)
    .eq("workspace_id", workspaceId)
    .maybeSingle();
  if (!data?.student_id) return NextResponse.json({ error: "Material não encontrado." }, { status: 404 });
  const fora = await negadoForaDoVinculo(session, data.student_id as string);
  if (fora) return NextResponse.json({ error: "Material não encontrado." }, { status: 404 });

  const meta = (data.metadata || {}) as Record<string, unknown>;
  return NextResponse.json({
    id: data.id,
    tipo: data.content_type,
    descricao: data.description,
    criadoEm: data.created_at,
    conteudo: typeof meta.conteudo === "string" ? meta.conteudo : "",
  });
}
