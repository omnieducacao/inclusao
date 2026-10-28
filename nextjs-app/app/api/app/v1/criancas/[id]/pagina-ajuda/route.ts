import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { pessoaDoPedido } from "@/lib/app/sessao";
import { acessoACrianca } from "@/lib/app/acesso";
import { logAction } from "@/lib/audit";
import { lerPaginaAjuda, paginaDaCrianca } from "@/lib/app/omniband";

/**
 * Frente 6 · página de ajuda da Omniband: o que vê quem encontra a criança e encosta o celular.
 * Só a família escreve e lê aqui. Sem endereço e sem diagnóstico: o app orienta isso na tela.
 * GET → a página (ou a padrão, se a família ainda não escreveu) · PUT → grava a página inteira
 */
type Ctx = { params: Promise<{ id: string }> };

async function soFamilia(req: Request, ctx: Ctx) {
  const pessoaId = await pessoaDoPedido(req);
  if (!pessoaId) return { erro: NextResponse.json({ error: "Não autenticado." }, { status: 401 }) };
  const { id } = await ctx.params;
  const acesso = await acessoACrianca(pessoaId, id);
  if (!acesso || acesso.papel !== "responsavel") {
    return { erro: NextResponse.json({ error: "Só a família escreve a página de ajuda." }, { status: 403 }) };
  }
  return { pessoaId, criancaId: id };
}

export async function GET(req: Request, ctx: Ctx) {
  const r = await soFamilia(req, ctx);
  if ("erro" in r) return r.erro;
  return NextResponse.json({ pagina: await paginaDaCrianca(r.criancaId) });
}

export async function PUT(req: Request, ctx: Ctx) {
  const r = await soFamilia(req, ctx);
  if ("erro" in r) return r.erro;
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const p = lerPaginaAjuda(b);
  if ("erro" in p) return NextResponse.json({ error: p.erro }, { status: 400 });

  const sb = getSupabase();
  const valores = {
    apelido: p.apelido,
    mensagem: p.mensagem,
    contatos: JSON.stringify(p.contatos), // cifrado inteiro (lib/colunas-cifradas.ts)
    mostrar_localizacao: p.mostrar_localizacao,
    ativa: p.ativa,
    atualizado_por: r.pessoaId,
    updated_at: new Date().toISOString(),
  };
  const { data: existe } = await sb.from("paginas_ajuda").select("crianca_id").eq("crianca_id", r.criancaId).maybeSingle();
  const { error } = existe
    ? await sb.from("paginas_ajuda").update(valores).eq("crianca_id", r.criancaId)
    : await sb.from("paginas_ajuda").insert({ crianca_id: r.criancaId, ...valores });
  if (error) return NextResponse.json({ error: "Não deu para salvar agora." }, { status: 500 });
  await logAction({ actorId: r.pessoaId, actorRole: "responsavel", action: "update", resourceType: "pagina_ajuda", resourceId: r.criancaId, req });
  return NextResponse.json({ ok: true, pagina: p });
}
