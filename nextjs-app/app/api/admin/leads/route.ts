import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";
import { logger } from "@/lib/logger";
import { STATUS_LEAD } from "@/lib/leads";

/** Contatos comerciais (onda 39): só o admin da plataforma lista, muda a situação e apaga. */
async function admin() {
  const session = await getSession();
  return !!session?.is_platform_admin;
}

export async function GET() {
  if (!(await admin())) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  try {
    const { data, error } = await getSupabase()
      .from("leads")
      .select("id, nome, email, telefone, escola, cargo, tipo_instituicao, faixa_estudantes, cidade, uf, mensagem, origem, papel_demo, modulos_vistos, status, notas, created_at, certificados(codigo, trilha, horas, reflexao, emitido_em)")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw error;
    return NextResponse.json({ leads: data || [] });
  } catch (err) {
    logger.error({ err }, "GET /api/admin/leads");
    return NextResponse.json({ error: "Não foi possível carregar os contatos." }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  if (!(await admin())) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  const b = (await req.json().catch(() => ({}))) as { id?: string; status?: string; notas?: string };
  if (!b.id) return NextResponse.json({ error: "Contato não informado." }, { status: 400 });
  const mudar: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (b.status !== undefined) {
    if (!(STATUS_LEAD as readonly string[]).includes(b.status)) return NextResponse.json({ error: "Situação inválida." }, { status: 400 });
    mudar.status = b.status;
  }
  if (b.notas !== undefined) mudar.notas = String(b.notas).slice(0, 4000);
  try {
    const { error } = await getSupabase().from("leads").update(mudar).eq("id", b.id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    logger.error({ err }, "PATCH /api/admin/leads");
    return NextResponse.json({ error: "Não foi possível salvar." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  if (!(await admin())) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Contato não informado." }, { status: 400 });
  try {
    const { error } = await getSupabase().from("leads").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    logger.error({ err }, "DELETE /api/admin/leads");
    return NextResponse.json({ error: "Não foi possível apagar." }, { status: 500 });
  }
}
