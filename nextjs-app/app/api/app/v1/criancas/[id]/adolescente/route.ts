import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { pessoaDoPedido } from "@/lib/app/sessao";
import { acessoACrianca } from "@/lib/app/acesso";
import { dadosDaCrianca } from "@/lib/app/familia";
import {
  CODIGO_MINUTOS, IDADE_MINIMA_ADOLESCENTE, VERSAO_TERMO_ADOLESCENTE, hashDoCodigo, idadeEm, novoCodigo,
} from "@/lib/app/adolescente";
import { logAction } from "@/lib/audit";

/**
 * Frente 6 · POST /api/app/v1/criancas/:id/adolescente — só a família:
 *   {acao: "gerar", nascimento?}  código de 8 caracteres para o filho ativar o app dele (vale 15 min, uma vez).
 *                      Onda 103: a criança que veio da escola chega sem nascimento; a família informa aqui.
 *   {acao: "pausar"} · {acao: "retomar"}   suspende ou devolve o acesso do adolescente
 *   {acao: "encerrar"} volta ao modo criança e desliga o acesso dele em todos os aparelhos
 */
type Ctx = { params: Promise<{ id: string }> };
type Crianca = { id: string; nascimento: string | null; adolescente_pessoa_id: string | null; adolescente_pausado: boolean };

export async function POST(req: Request, ctx: Ctx) {
  const pessoaId = await pessoaDoPedido(req);
  if (!pessoaId) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const { id } = await ctx.params;
  const acesso = await acessoACrianca(pessoaId, id);
  if (acesso?.papel !== "responsavel") return NextResponse.json({ error: "Só a família decide o modo adolescente." }, { status: 403 });
  const sb = getSupabase();
  const { data } = await sb.from("criancas").select("id, nascimento, adolescente_pessoa_id, adolescente_pausado").eq("id", id).maybeSingle();
  const c = data as Crianca | null;
  if (!c) return NextResponse.json({ error: "Criança não encontrada." }, { status: 404 });

  const b = (await req.json().catch(() => ({}))) as { acao?: unknown; nascimento?: unknown };
  const agora = new Date().toISOString();
  const registrar = (acao: string) =>
    logAction({ actorId: pessoaId, actorRole: "responsavel", action: "permission_change", resourceType: "modo_adolescente", resourceId: id, metadata: { acao }, req });

  switch (b.acao) {
    case "gerar": {
      if (!c.nascimento && b.nascimento) {
        const d = dadosDaCrianca({ nome: "Criança", nascimento: b.nascimento });
        if ("erro" in d || !d.nascimento) return NextResponse.json({ error: "erro" in d ? d.erro : "Confira a data de nascimento." }, { status: 400 });
        await sb.from("criancas").update({ nascimento: d.nascimento, updated_at: agora }).eq("id", id);
        c.nascimento = d.nascimento;
      }
      const idade = idadeEm(c.nascimento);
      if (idade === null) return NextResponse.json({ error: "Cadastre a data de nascimento antes." }, { status: 400 });
      if (idade < IDADE_MINIMA_ADOLESCENTE) {
        return NextResponse.json({ error: `O modo adolescente é a partir dos ${IDADE_MINIMA_ADOLESCENTE} anos.` }, { status: 400 });
      }
      // um código por vez: o anterior, se ainda não usado, deixa de valer
      await sb.from("adolescente_codigos").update({ expira_em: agora }).eq("crianca_id", id).is("usado_em", null);
      const codigo = novoCodigo();
      const expira = new Date(Date.now() + CODIGO_MINUTOS * 60_000).toISOString();
      const { error } = await sb.from("adolescente_codigos").insert({ crianca_id: id, codigo_hash: hashDoCodigo(codigo), criado_por: pessoaId, expira_em: expira });
      if (error) return NextResponse.json({ error: "Não deu para gerar o código agora." }, { status: 500 });
      await registrar("gerou_codigo");
      return NextResponse.json({ ok: true, codigo, expira_em: expira, minutos: CODIGO_MINUTOS });
    }
    case "pausar":
    case "retomar": {
      if (!c.adolescente_pessoa_id) return NextResponse.json({ error: "O modo adolescente não está ativo." }, { status: 400 });
      await sb.from("criancas").update({ adolescente_pausado: b.acao === "pausar", updated_at: agora }).eq("id", id);
      await registrar(b.acao);
      return NextResponse.json({ ok: true });
    }
    case "encerrar": {
      const teen = c.adolescente_pessoa_id;
      if (!teen) return NextResponse.json({ error: "O modo adolescente não está ativo." }, { status: 400 });
      await sb.from("app_sessoes").update({ revogada_em: agora }).eq("pessoa_id", teen).is("revogada_em", null);
      await sb.from("pessoas").update({ ativo: false, updated_at: agora }).eq("id", teen);
      await sb.from("criancas").update({ modo: "crianca", adolescente_pessoa_id: null, adolescente_pausado: false, updated_at: agora }).eq("id", id);
      await sb.from("consentimentos").insert({ crianca_id: id, autorizado_por: pessoaId, acao: "encerrou_adolescente", versao_termo: VERSAO_TERMO_ADOLESCENTE });
      await registrar("encerrou");
      return NextResponse.json({ ok: true });
    }
    default:
      return NextResponse.json({ error: "Ação inválida." }, { status: 400 });
  }
}
