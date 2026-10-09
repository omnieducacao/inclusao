import { parseBody, studentPatchDataSchema } from "@/lib/validation";
import { negadoForaDoVinculo } from "@/lib/turmas";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { updateStudentDailyLogs } from "@/lib/students";
import { requirePermission } from "@/lib/permissions";
import { getSupabase } from "@/lib/supabase";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.workspace_id) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const denied = requirePermission(session, "can_diario");
  if (denied) return denied;

  const { id } = await params;
  const foraDoVinculo = await negadoForaDoVinculo(session, id);
  if (foraDoVinculo) return foraDoVinculo;
  const parsed = await parseBody(req, studentPatchDataSchema);

  if (parsed.error) return parsed.error;

  const body = parsed.data;

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }

  const dailyLogs = Array.isArray(body.daily_logs) ? body.daily_logs : [];
  const result = await updateStudentDailyLogs(session.workspace_id, id, dailyLogs);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error || "Erro ao salvar Diário." },
      { status: 500 }
    );
  }
  return NextResponse.json({ ok: true });
}

/**
 * Onda 16: o diário salva um registro por vez (antes a tela mandava a lista inteira, e dois
 * usuários salvando juntos podiam apagar o registro um do outro).
 * POST { registro } inclui ou atualiza pelo registro_id · DELETE ?registro_id= exclui.
 */
async function preparar(req: Request, params: Promise<{ id: string }>) {
  const session = await getSession();
  if (!session?.workspace_id) return { erro: NextResponse.json({ error: "Não autenticado." }, { status: 401 }) };
  const denied = requirePermission(session, "can_diario");
  if (denied) return { erro: denied };
  const { id } = await params;
  const fora = await negadoForaDoVinculo(session, id);
  if (fora) return { erro: fora };
  return { session, id, workspaceId: session.workspace_id as string };
}

/** Sem a função do banco (antes da migração da onda 16), faz ler-alterar-gravar no servidor. */
async function semFuncao(workspaceId: string, studentId: string, mudar: (lista: Array<Record<string, unknown>>) => Array<Record<string, unknown>>) {
  const sb = getSupabase();
  const { data, error } = await sb.from("students").select("daily_logs").eq("id", studentId).eq("workspace_id", workspaceId).maybeSingle();
  if (error || !data) return { success: false, error: error?.message || "Estudante não encontrado." };
  const lista = Array.isArray(data.daily_logs) ? (data.daily_logs as Array<Record<string, unknown>>) : [];
  return updateStudentDailyLogs(workspaceId, studentId, mudar(lista));
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const p = await preparar(req, params);
  if ("erro" in p) return p.erro;
  const body = (await req.json().catch(() => null)) as { registro?: Record<string, unknown> } | null;
  const reg = body?.registro;
  if (!reg || typeof reg !== "object" || !String(reg.atividade_principal || "").trim()) {
    return NextResponse.json({ error: "Escreva o que foi feito para salvar." }, { status: 400 });
  }
  const agora = new Date().toISOString();
  const registro: Record<string, unknown> = {
    ...reg,
    registro_id: typeof reg.registro_id === "string" && reg.registro_id ? reg.registro_id : crypto.randomUUID(),
    student_id: p.id,
    criado_em: reg.criado_em || agora,
    ...(reg.registro_id ? { atualizado_em: agora } : {}),
    registrado_por: reg.registrado_por || p.session.usuario_nome || null,
  };
  const sb = getSupabase();
  const { error } = await sb.rpc("diario_salvar_registro", { p_workspace: p.workspaceId, p_student: p.id, p_registro: registro });
  if (error) {
    const r = await semFuncao(p.workspaceId, p.id, (lista) => [...lista.filter((x) => x.registro_id !== registro.registro_id), registro]);
    if (!r.success) return NextResponse.json({ error: r.error || "Erro ao salvar o registro." }, { status: 500 });
  }
  return NextResponse.json({ ok: true, registro });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const p = await preparar(req, params);
  if ("erro" in p) return p.erro;
  const registroId = new URL(req.url).searchParams.get("registro_id");
  if (!registroId) return NextResponse.json({ error: "registro_id obrigatório" }, { status: 400 });
  const sb = getSupabase();
  const { error } = await sb.rpc("diario_excluir_registro", { p_workspace: p.workspaceId, p_student: p.id, p_registro_id: registroId });
  if (error) {
    const r = await semFuncao(p.workspaceId, p.id, (lista) => lista.filter((x) => x.registro_id !== registroId));
    if (!r.success) return NextResponse.json({ error: r.error || "Erro ao excluir o registro." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
