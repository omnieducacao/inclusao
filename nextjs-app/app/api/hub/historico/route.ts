import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";
import { negadoForaDoVinculo } from "@/lib/turmas";
import { nomeDoMaterial } from "@/lib/hub-tracking";

/**
 * GET /api/hub/historico?studentId=… (onda 3)
 * Materiais gerados para o estudante (sem o texto; o texto vem em /api/hub/historico/[id]).
 */
export async function GET(req: Request) {
  const session = await getSession();
  const workspaceId = session?.simulating_workspace_id || session?.workspace_id;
  if (!session || !workspaceId || session.user_role === "family") {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  const studentId = new URL(req.url).searchParams.get("studentId") || "";
  if (!studentId) return NextResponse.json({ materiais: [] });
  const fora = await negadoForaDoVinculo(session, studentId);
  if (fora) return fora;

  const { data } = await getSupabase()
    .from("hub_generated_content")
    .select("id, content_type, description, engine, metadata, created_at, workspace_members(nome)")
    .eq("workspace_id", workspaceId)
    .eq("student_id", studentId)
    .order("created_at", { ascending: false })
    .limit(50);

  type Linha = {
    id: string; content_type: string; description: string | null; engine: string | null; created_at: string;
    metadata: Record<string, unknown> | null; workspace_members: { nome: string } | { nome: string }[] | null;
  };
  const materiais = ((data || []) as unknown as Linha[]).map((m) => {
    const autor = Array.isArray(m.workspace_members) ? m.workspace_members[0] : m.workspace_members;
    return {
      id: m.id,
      tipo: m.content_type,
      tipoNome: nomeDoMaterial(m.content_type),
      descricao: m.description,
      criadoEm: m.created_at,
      autor: autor?.nome || null,
      versaoPei: (m.metadata?.versao_pei as number | null) ?? null,
      temConteudo: typeof m.metadata?.conteudo === "string" && (m.metadata.conteudo as string).length > 0,
    };
  });
  return NextResponse.json({ materiais });
}
