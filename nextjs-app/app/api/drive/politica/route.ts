import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";
import { normalizarDominio, normalizarPolitica } from "@/lib/drive-politica";
import { lerPoliticaDrive } from "@/lib/drive-politica-servidor";
import { auditar } from "@/lib/audit";

/**
 * Onda 92 · SCRUM-243: regra da escola para "Salvar no Drive".
 * GET: qualquer pessoa da equipe lê (a tela decide se mostra o botão). Família não tem Drive.
 * PATCH: só gestão muda. Body: { drive_salvar?: "desligado" | "dominio" | "qualquer"; drive_dominio?: string }
 */
export async function GET() {
  const session = await getSession();
  if (!session?.workspace_id || session.user_role === "family") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  return NextResponse.json(await lerPoliticaDrive(session.workspace_id));
}

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session?.workspace_id || session.user_role === "family") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const member = session.member as Record<string, unknown> | undefined;
  if (!(session.user_role === "master" || member?.can_gestao)) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  let body: { drive_salvar?: unknown; drive_dominio?: unknown };
  try {
    body = await req.json();
  } catch { /* expected fallback */
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (body.drive_salvar !== undefined) updates.drive_salvar = normalizarPolitica(body.drive_salvar);
  if (body.drive_dominio !== undefined) {
    const dominio = normalizarDominio(body.drive_dominio);
    if (String(body.drive_dominio ?? "").trim() && !dominio) {
      return NextResponse.json({ error: "Domínio inválido. Exemplo: escola.com.br" }, { status: 400 });
    }
    updates.drive_dominio = dominio || null;
  }
  if (updates.drive_salvar === "dominio" && body.drive_dominio === undefined) {
    const atual = await lerPoliticaDrive(session.workspace_id);
    if (!atual.dominio) return NextResponse.json({ error: "Informe o domínio de e-mail da escola." }, { status: 400 });
  }
  if (updates.drive_salvar === "dominio" && body.drive_dominio !== undefined && !updates.drive_dominio) {
    return NextResponse.json({ error: "Informe o domínio de e-mail da escola." }, { status: 400 });
  }
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nenhuma alteração enviada" }, { status: 400 });
  }

  const { error } = await getSupabase().from("workspaces").update(updates).eq("id", session.workspace_id);
  if (error) {
    const semColuna = /drive_salvar|drive_dominio/.test(error.message);
    return NextResponse.json(
      { error: semColuna ? "Falta aplicar a atualização do banco (Onda 92)." : error.message },
      { status: 500 }
    );
  }
  await auditar(session, req, {
    action: "permission_change",
    resourceType: "drive_politica",
    resourceId: session.workspace_id,
    metadata: { drive_salvar: updates.drive_salvar, dominio_definido: updates.drive_dominio !== undefined },
  });
  return NextResponse.json({ ok: true });
}
