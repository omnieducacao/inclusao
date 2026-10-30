import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { pessoaDoPedido } from "@/lib/app/sessao";
import { acessoACrianca } from "@/lib/app/acesso";
import { AREAS, areaDoMembro, lerSessao, podeVerRegistro } from "@/lib/app/sessoes";
import { logAction } from "@/lib/audit";

/**
 * Frente 6 · onda 106 · registro de sessão (fono, psicopedagoga, psicóloga, TO, médico, professor).
 * GET  → a área de quem pede (com os rótulos do formulário) e as últimas sessões que essa pessoa pode ver
 * POST → {como_foi, trabalhado?, resposta?, reservado?, quando?, compromisso_id?, tarefa?: {titulo, etapas?}}
 *        Precisa poder escrever orientações (o padrão para o profissional convidado). A sessão vira um
 *        registro "terapia" na linha do tempo; a tarefa da semana vira uma missão em casa, por 7 dias.
 */
type Ctx = { params: Promise<{ id: string }> };

async function areaDe(membroId: string | undefined) {
  if (!membroId) return "outra" as const;
  const { data } = await getSupabase().from("rede_membros").select("tipo, especialidade").eq("id", membroId).maybeSingle();
  const m = data as { tipo: string; especialidade: string | null } | null;
  return areaDoMembro(m?.tipo, m?.especialidade);
}

export async function GET(req: Request, ctx: Ctx) {
  const pessoaId = await pessoaDoPedido(req);
  if (!pessoaId) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const { id } = await ctx.params;
  const acesso = await acessoACrianca(pessoaId, id);
  if (!acesso) return NextResponse.json({ error: "Sem acesso a esta criança." }, { status: 403 });
  const area = await areaDe(acesso.membroId);
  const pode_registrar = acesso.papel === "responsavel" || acesso.escrever.has("orientacoes");
  if (!acesso.ver.has("orientacoes")) return NextResponse.json({ area, rotulos: AREAS[area], pode_registrar, sessoes: [] });
  const { data } = await getSupabase()
    .from("registros")
    .select("id, subtipo, quando, texto, dados, autor_pessoa_id, autor_membro_id")
    .eq("crianca_id", id)
    .eq("tipo", "terapia")
    .is("apagado_em", null)
    .order("quando", { ascending: false })
    .limit(60);
  const sessoes = ((data as { dados?: { sessao?: boolean }; autor_pessoa_id: string | null }[] | null) || [])
    .filter((r) => r.dados?.sessao && podeVerRegistro(r, pessoaId, acesso.papel))
    .slice(0, 20);
  return NextResponse.json({ area, rotulos: AREAS[area], pode_registrar, sessoes });
}

export async function POST(req: Request, ctx: Ctx) {
  const pessoaId = await pessoaDoPedido(req);
  if (!pessoaId) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const { id } = await ctx.params;
  const acesso = await acessoACrianca(pessoaId, id);
  if (!acesso || (acesso.papel !== "responsavel" && !acesso.escrever.has("orientacoes"))) {
    return NextResponse.json({ error: "Você não registra sessões para esta criança." }, { status: 403 });
  }
  const area = await areaDe(acesso.membroId);
  const dados = lerSessao((await req.json().catch(() => ({}))) as Record<string, unknown>, area);
  if ("erro" in dados) return NextResponse.json({ error: dados.erro }, { status: 400 });
  const sb = getSupabase();
  const agora = new Date().toISOString();

  let missaoId: string | null = null;
  if (dados.tarefa) {
    const ate = new Date(Date.now() + 7 * 86_400_000).toISOString().slice(0, 10);
    const { data: m } = await sb.from("app_missoes").insert({
      crianca_id: id, titulo: dados.tarefa.titulo, etapas: dados.tarefa.etapas, origem: "orientacao",
      meta_ref: `${AREAS[area].tarefa} · ${AREAS[area].rotulo}`.slice(0, 80), onde: "casa", ate, status: "ativa", criada_por: pessoaId,
    }).select("id").single();
    missaoId = (m as { id: string } | null)?.id ?? null;
  }

  const { data, error } = await sb.from("registros").insert({
    crianca_id: id, tipo: "terapia", categoria: "orientacoes", subtipo: area, quando: dados.quando, local: "terapia",
    texto: dados.como_foi, intensidade: null, duracao: null, gatilho: null,
    dados: {
      sessao: true, area, trabalhado: dados.trabalhado, resposta: dados.resposta, reservado: dados.reservado,
      compromisso_id: dados.compromisso_id, tarefa: dados.tarefa?.titulo ?? null, missao_id: missaoId,
    },
    autor_pessoa_id: pessoaId, autor_membro_id: acesso.membroId || null, origem: "app", created_at: agora,
  }).select("id").single();
  if (error || !data) return NextResponse.json({ error: "Não deu para registrar a sessão agora." }, { status: 500 });
  const rid = (data as { id: string }).id;
  await logAction({ actorId: pessoaId, actorRole: acesso.papel, action: "create", resourceType: "sessao", resourceId: rid, metadata: { area, tarefa: !!missaoId, reservado: dados.reservado }, req });
  return NextResponse.json({ ok: true, id: rid, missao_id: missaoId }, { status: 201 });
}
