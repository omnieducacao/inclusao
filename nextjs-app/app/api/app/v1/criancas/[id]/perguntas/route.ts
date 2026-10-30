import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { pessoaDoPedido } from "@/lib/app/sessao";
import { acessoACrianca } from "@/lib/app/acesso";
import { lerPara, paraPergunta, SUBTIPO_PERGUNTA } from "@/lib/app/perguntas";
import { logAction } from "@/lib/audit";

/**
 * Frente 6 · onda 112 · perguntas para a consulta (lib/app/perguntas.ts). Só a família.
 * GET  → as perguntas (abertas primeiro, depois as respondidas dos últimos 90 dias)
 * POST → { texto, para } anota uma pergunta nova
 */
type Ctx = { params: Promise<{ id: string }> };

async function daFamilia(req: Request, ctx: Ctx) {
  const pessoaId = await pessoaDoPedido(req);
  if (!pessoaId) return { erro: NextResponse.json({ error: "Não autenticado." }, { status: 401 }) };
  const { id } = await ctx.params;
  const acesso = await acessoACrianca(pessoaId, id);
  if (!acesso) return { erro: NextResponse.json({ error: "Sem acesso a esta criança." }, { status: 403 }) };
  if (acesso.papel !== "responsavel") return { erro: NextResponse.json({ error: "As perguntas para a consulta são só da família." }, { status: 403 }) };
  return { pessoaId, id, acesso };
}

export async function GET(req: Request, ctx: Ctx) {
  const f = await daFamilia(req, ctx);
  if ("erro" in f) return f.erro;
  const { data, error } = await getSupabase()
    .from("registros")
    .select("id, texto, quando, dados")
    .eq("crianca_id", f.id)
    .eq("subtipo", SUBTIPO_PERGUNTA)
    .is("apagado_em", null)
    .order("quando", { ascending: false })
    .limit(200);
  if (error) return NextResponse.json({ error: "Não deu para abrir as perguntas." }, { status: 500 });
  const limite = Date.now() - 90 * 864e5;
  const todas = ((data as { id: string; texto: string | null; quando: string; dados: unknown }[] | null) || []).map(paraPergunta);
  const abertas = todas.filter((p) => !p.respondida_em);
  const respondidas = todas.filter((p) => p.respondida_em && Date.parse(p.respondida_em) >= limite);
  await logAction({ actorId: f.pessoaId, actorRole: f.acesso.papel, action: "view", resourceType: "perguntas", resourceId: f.id, req });
  return NextResponse.json({ abertas, respondidas });
}

export async function POST(req: Request, ctx: Ctx) {
  const f = await daFamilia(req, ctx);
  if ("erro" in f) return f.erro;
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const texto = typeof b.texto === "string" ? b.texto.trim().slice(0, 300) : "";
  if (texto.length < 3) return NextResponse.json({ error: "Escreva a pergunta." }, { status: 400 });
  const { data, error } = await getSupabase()
    .from("registros")
    .insert({
      crianca_id: f.id,
      tipo: "evento",
      categoria: "eventos_casa",
      subtipo: SUBTIPO_PERGUNTA,
      quando: new Date().toISOString(),
      local: "casa",
      texto,
      dados: { reservado: true, para: lerPara(b.para) },
      autor_pessoa_id: f.pessoaId,
      origem: "app",
    })
    .select("id")
    .single();
  if (error || !data) return NextResponse.json({ error: "Não deu para anotar agora." }, { status: 500 });
  await logAction({ actorId: f.pessoaId, actorRole: f.acesso.papel, action: "create", resourceType: "pergunta", resourceId: (data as { id: string }).id, req });
  return NextResponse.json({ ok: true, id: (data as { id: string }).id }, { status: 201 });
}
