import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { requireAuthAndPermission } from "@/lib/permissions";

/**
 * POST /api/hub/salvar-no-plano
 * Persiste conteúdo gerado no Hub em um plano de ensino (4.4.2).
 * Body: { plano_ensino_id, conteudo, tipo? }
 */
export async function POST(req: Request) {
  const { session, error: authError } = await requireAuthAndPermission("can_hub");
  if (authError) return authError;

  const body = await req.json();
  const { plano_ensino_id, conteudo, tipo } = body as {
    plano_ensino_id: string;
    conteudo: string;
    tipo?: string;
  };

  if (!plano_ensino_id || typeof conteudo !== "string") {
    return NextResponse.json(
      { error: "plano_ensino_id e conteudo são obrigatórios" },
      { status: 400 }
    );
  }

  const wsId = session?.simulating_workspace_id || session?.workspace_id;
  if (!wsId) {
    return NextResponse.json({ error: "Sessão inválida" }, { status: 401 });
  }

  const sb = getSupabase();

  // Verificar que o plano pertence ao workspace
  const { data: plano, error: fetchErr } = await sb
    .from("planos_ensino")
    .select("id, conteudo")
    .eq("id", plano_ensino_id)
    .eq("workspace_id", wsId)
    .single();

  if (fetchErr || !plano) {
    return NextResponse.json({ error: "Plano não encontrado" }, { status: 404 });
  }

  const separador = "\n\n--- Conteúdo gerado pelo Hub";
  const bloco = tipo ? ` (${tipo})` : "";
  const novoConteudo = (plano.conteudo || "").trim()
    ? `${plano.conteudo}${separador}${bloco} ---\n${conteudo}`
    : conteudo;

  const { error: updateErr } = await sb
    .from("planos_ensino")
    .update({
      conteudo: novoConteudo,
      updated_at: new Date().toISOString(),
    })
    .eq("id", plano_ensino_id)
    .eq("workspace_id", wsId);

  if (updateErr) {
    console.error("Erro ao salvar no plano:", updateErr);
    return NextResponse.json({ error: "Erro ao salvar" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, plano_ensino_id });
}
