import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { pessoaDoPedido } from "@/lib/app/sessao";
import { acessoACrianca } from "@/lib/app/acesso";
import { abrirAparencia, lerAparencia } from "@/lib/app/aparencia";
import { logAction } from "@/lib/audit";

/**
 * Frente 6 · onda 122 · GET/PUT /api/app/v1/criancas/:id/aparencia — o avatar e a família montada,
 * iguais em todos os celulares da casa.
 * GET: a família e o adolescente leem (a rede de apoio não vê). Sem nada guardado: aparencia null.
 * PUT {avatar, familia, em}: só a família muda. `em` é quando a mudança foi feita no celular; uma
 * mudança mais antiga que a guardada não sobrescreve (responde 409 com a guardada, e o app adota).
 * Sem a migração no banco: o GET devolve null com em_breve e o PUT responde 503.
 * O registro de auditoria não leva o conteúdo (só que mudou).
 */
type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: Request, ctx: Ctx) {
  const pessoaId = await pessoaDoPedido(req);
  if (!pessoaId) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const { id } = await ctx.params;
  const acesso = await acessoACrianca(pessoaId, id);
  if (!acesso || acesso.papel === "membro") return NextResponse.json({ error: "Sem acesso a esta criança." }, { status: 403 });
  const { data, error } = await getSupabase().from("criancas").select("aparencia, aparencia_em").eq("id", id).maybeSingle();
  if (error) return NextResponse.json({ aparencia: null, em: null, em_breve: true });
  const linha = data as { aparencia?: unknown; aparencia_em?: string | null } | null;
  return NextResponse.json({ aparencia: abrirAparencia(linha?.aparencia), em: linha?.aparencia_em ?? null });
}

export async function PUT(req: Request, ctx: Ctx) {
  const pessoaId = await pessoaDoPedido(req);
  if (!pessoaId) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const { id } = await ctx.params;
  const acesso = await acessoACrianca(pessoaId, id);
  if (acesso?.papel !== "responsavel") return NextResponse.json({ error: "Só a família muda o avatar e a família." }, { status: 403 });
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const aparencia = lerAparencia(b);
  if (!aparencia) return NextResponse.json({ error: "Avatar ou família com algo que não reconhecemos." }, { status: 400 });
  const agora = Date.now();
  const quando = typeof b.em === "string" ? Date.parse(b.em) : NaN;
  // o relógio do celular pode estar adiantado: nunca aceita data no futuro
  const em = new Date(Number.isFinite(quando) ? Math.min(quando, agora) : agora).toISOString();

  const sb = getSupabase();
  const atual = await sb.from("criancas").select("aparencia, aparencia_em").eq("id", id).maybeSingle();
  if (atual.error) return NextResponse.json({ error: "Esta parte chega em breve.", em_breve: true }, { status: 503 });
  const guardada = atual.data as { aparencia?: unknown; aparencia_em?: string | null } | null;
  if (guardada?.aparencia_em && Date.parse(guardada.aparencia_em) > Date.parse(em)) {
    return NextResponse.json(
      { error: "Outro celular da família mudou depois.", aparencia: abrirAparencia(guardada.aparencia), em: guardada.aparencia_em },
      { status: 409 },
    );
  }
  const { error } = await sb.from("criancas").update({ aparencia: JSON.stringify(aparencia), aparencia_em: em }).eq("id", id);
  if (error) return NextResponse.json({ error: "Esta parte chega em breve.", em_breve: true }, { status: 503 });
  await logAction({ actorId: pessoaId, actorRole: "responsavel", action: "update", resourceType: "crianca_aparencia", resourceId: id, metadata: { pessoas: aparencia.familia.length }, req });
  return NextResponse.json({ ok: true, em });
}
