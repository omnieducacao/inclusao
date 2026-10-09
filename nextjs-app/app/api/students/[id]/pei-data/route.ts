import { parseBody, studentPatchDataSchema } from "@/lib/validation";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";
import { logger } from "@/lib/logger";
import { decryptSensitivePeiFields } from "@/lib/encryption";
import { updateStudentPeiData } from "@/lib/students";

/**
 * Rota alternativa para buscar apenas o pei_data de um estudante.
 * Usa quando o estudante está na lista mas a API principal retorna 404.
 * Sempre filtra pela escola da sessão (onda 0: antes buscava por id sem checar a escola).
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
    .eq("workspace_id", session.workspace_id)
    .maybeSingle();

  if (error) {
    logger.error({ err: error }, "Erro ao buscar pei_data:");
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

  // Retornar o pei_data (pode ser null se não tiver dados salvos), já descriptografado
  let pei = (data.pei_data as Record<string, unknown>) || null;
  if (pei) {
    try { pei = decryptSensitivePeiFields(pei); } catch { /* dados antigos sem criptografia */ }
  }
  return NextResponse.json({ pei_data: pei });
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

  // LGPD: grava com os campos sensíveis criptografados, como o resto do app
  const ok = await updateStudentPeiData(session.workspace_id, id, pei_data as Record<string, unknown>);

  if (!ok) {
    logger.error("Erro ao atualizar pei_data");
    return NextResponse.json(
      { error: "Erro ao atualizar dados do PEI." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
