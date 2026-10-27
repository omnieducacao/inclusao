import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { ipDaRequisicao, limitarPorChave, rateLimitResponse, RATE_LIMITS } from "@/lib/rate-limit";
import { abrirSessao } from "@/lib/app/sessao";
import { VERSAO_TERMO_ADOLESCENTE, hashDoCodigo, normalizarCodigo } from "@/lib/app/adolescente";
import { logAction } from "@/lib/audit";
import { logger } from "@/lib/logger";

const INVALIDO = "Código inválido ou vencido. Peça um novo para sua família.";

/**
 * Frente 6 · POST /api/app/v1/auth/adolescente {codigo, dispositivo?}
 * O adolescente ativa o app dele com o código que a família gerou. Não há e-mail nem senha:
 * o celular dele guarda o token de renovação. Ativar de novo (celular novo) desliga o aparelho antigo.
 */
export async function POST(req: Request) {
  const rl = rateLimitResponse(req, RATE_LIMITS.AUTH_IP); if (rl) return rl;
  const porIp = limitarPorChave(`app-adolescente:${ipDaRequisicao(req)}`, RATE_LIMITS.AUTH);
  if (porIp) return porIp;
  try {
    const b = (await req.json().catch(() => ({}))) as { codigo?: unknown; dispositivo?: unknown };
    const codigo = normalizarCodigo(b.codigo);
    if (!codigo) return NextResponse.json({ error: INVALIDO }, { status: 400 });
    const sb = getSupabase();
    const { data } = await sb
      .from("adolescente_codigos")
      .select("id, crianca_id, criado_por, expira_em, usado_em")
      .eq("codigo_hash", hashDoCodigo(codigo))
      .is("usado_em", null)
      .maybeSingle();
    const cod = data as { id: string; crianca_id: string; criado_por: string; expira_em: string } | null;
    if (!cod || Date.parse(cod.expira_em) <= Date.now()) {
      await logAction({ action: "login_failed", resourceType: "modo_adolescente", metadata: { canal: "app" }, req });
      return NextResponse.json({ error: INVALIDO }, { status: 401 });
    }
    const agora = new Date().toISOString();
    // usa o código antes de qualquer outra coisa: duas tentativas ao mesmo tempo não ativam dois aparelhos
    const { data: usado } = await sb.from("adolescente_codigos").update({ usado_em: agora }).eq("id", cod.id).is("usado_em", null).select("id");
    if (!((usado as unknown[] | null) || []).length) return NextResponse.json({ error: INVALIDO }, { status: 401 });

    const { data: cr } = await sb.from("criancas").select("id, nome, adolescente_pessoa_id, adolescente_pausado").eq("id", cod.crianca_id).maybeSingle();
    const c = cr as { id: string; nome: string; adolescente_pessoa_id: string | null; adolescente_pausado: boolean } | null;
    if (!c) return NextResponse.json({ error: INVALIDO }, { status: 401 });
    if (c.adolescente_pausado) return NextResponse.json({ error: "Seu acesso está pausado pela família." }, { status: 403 });

    let pessoaId = c.adolescente_pessoa_id;
    if (pessoaId) {
      await sb.from("app_sessoes").update({ revogada_em: agora }).eq("pessoa_id", pessoaId).is("revogada_em", null);
      await sb.from("pessoas").update({ ativo: true, updated_at: agora }).eq("id", pessoaId);
    } else {
      const nome = String(c.nome || "").split(" ")[0] || "Adolescente";
      const { data: p, error } = await sb.from("pessoas").insert({ nome, ativo: true, termos_aceitos_em: agora }).select("id").single();
      if (error || !p) return NextResponse.json({ error: "Não deu para ativar agora." }, { status: 500 });
      pessoaId = (p as { id: string }).id;
      await sb.from("criancas").update({ modo: "adolescente", adolescente_pessoa_id: pessoaId, updated_at: agora }).eq("id", c.id);
      await sb.from("consentimentos").insert({ crianca_id: c.id, autorizado_por: cod.criado_por, acao: "ativou_adolescente", versao_termo: VERSAO_TERMO_ADOLESCENTE });
    }
    const tokens = await abrirSessao(pessoaId, typeof b.dispositivo === "string" ? b.dispositivo : null);
    await logAction({ actorId: pessoaId, actorRole: "adolescente", action: "login", resourceType: "modo_adolescente", resourceId: c.id, req });
    return NextResponse.json({ ok: true, pessoa: { id: pessoaId }, crianca_id: c.id, ...tokens });
  } catch (err) {
    logger.error({ err }, "app: erro ao ativar o modo adolescente");
    return NextResponse.json({ error: "Não deu para ativar agora. Tente de novo." }, { status: 500 });
  }
}
