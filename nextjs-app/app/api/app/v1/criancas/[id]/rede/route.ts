import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { hashToken, pessoaDoPedido } from "@/lib/app/sessao";
import { acessoACrianca } from "@/lib/app/acesso";
import {
  CONVITE_DIAS, VERSAO_TERMO_REDE, acessoAte, ehTipoConvidado, linhasDePermissao, linkDoConvite,
  normalizarPermissoes, novoTokenDeConvite, paraConsentimento,
} from "@/lib/app/rede";
import { logAction } from "@/lib/audit";

/**
 * Frente 6 · a rede de apoio de uma criança. Só o responsável da família mexe aqui.
 * GET  → membros (convidados, ativos, pausados, revogados) com o que cada um vê e escreve
 * POST → convida {tipo: profissional|professor, nome, especialidade?, conselho?, permissoes?, acesso_ate?,
 *        consentimento: true}. Devolve o link do convite UMA vez: a família manda por WhatsApp ou e-mail.
 */
type Ctx = { params: Promise<{ id: string }> };
type Membro = { id: string; tipo: string; nome: string; especialidade: string | null; status: string; acesso_ate: string | null; convite_expira_em: string | null; aceito_em: string | null; created_at: string };
type LinhaPerm = { membro_id: string; categoria: string; pode_ver: boolean; pode_escrever: boolean };

function texto(x: unknown, max: number): string | null {
  return typeof x === "string" && x.trim() ? x.trim().slice(0, max) : null;
}

export async function GET(req: Request, ctx: Ctx) {
  const pessoaId = await pessoaDoPedido(req);
  if (!pessoaId) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const { id } = await ctx.params;
  const acesso = await acessoACrianca(pessoaId, id);
  if (acesso?.papel !== "responsavel") return NextResponse.json({ error: "Só a família vê e muda a rede." }, { status: 403 });

  const sb = getSupabase();
  const { data } = await sb
    .from("rede_membros")
    .select("id, tipo, nome, especialidade, status, acesso_ate, convite_expira_em, aceito_em, created_at")
    .eq("crianca_id", id)
    .order("created_at", { ascending: true });
  const membros = (data as Membro[] | null) || [];
  const { data: perms } = membros.length
    ? await sb.from("rede_permissoes").select("membro_id, categoria, pode_ver, pode_escrever").in("membro_id", membros.map((m) => m.id))
    : { data: [] };
  const porMembro = new Map<string, { categoria: string; ver: boolean; escrever: boolean }[]>();
  for (const p of (perms as LinhaPerm[] | null) || []) {
    const lista = porMembro.get(p.membro_id) || [];
    lista.push({ categoria: p.categoria, ver: p.pode_ver, escrever: p.pode_escrever });
    porMembro.set(p.membro_id, lista);
  }
  const hoje = new Date().toISOString().slice(0, 10);
  return NextResponse.json({
    membros: membros.map((m) => ({
      ...m,
      // convite não aceito e vencido aparece como tal, para a família reenviar
      status: m.status === "convidado" && m.convite_expira_em && Date.parse(m.convite_expira_em) < Date.now() ? "convite_vencido"
        : m.status === "ativo" && m.acesso_ate && m.acesso_ate < hoje ? "acesso_vencido" : m.status,
      permissoes: porMembro.get(m.id) || [],
    })),
  });
}

export async function POST(req: Request, ctx: Ctx) {
  const pessoaId = await pessoaDoPedido(req);
  if (!pessoaId) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const { id } = await ctx.params;
  const acesso = await acessoACrianca(pessoaId, id);
  if (acesso?.papel !== "responsavel") return NextResponse.json({ error: "Só a família convida para a rede." }, { status: 403 });

  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  if (!ehTipoConvidado(b.tipo)) return NextResponse.json({ error: "Escolha se é profissional ou professor." }, { status: 400 });
  const nome = texto(b.nome, 120);
  if (!nome || nome.length < 2) return NextResponse.json({ error: "Informe o nome de quem vai receber o convite." }, { status: 400 });
  if (b.consentimento !== true) {
    return NextResponse.json({ error: "Confirme que autoriza o compartilhamento do que marcou." }, { status: 400 });
  }
  const ate = acessoAte(b.acesso_ate);
  if (!ate) return NextResponse.json({ error: "O acesso pode durar de hoje até 2 anos." }, { status: 400 });
  const permissoes = normalizarPermissoes(b.tipo, b.permissoes);
  if (!permissoes.length) return NextResponse.json({ error: "Marque pelo menos uma coisa que essa pessoa pode ver." }, { status: 400 });

  const sb = getSupabase();
  const { data: ativos } = await sb.from("rede_membros").select("id").eq("crianca_id", id).in("status", ["convidado", "ativo", "pausado"]);
  if (((ativos as unknown[] | null) || []).length >= 20) return NextResponse.json({ error: "A rede desta criança chegou a 20 pessoas." }, { status: 400 });

  const token = novoTokenDeConvite();
  const { data: m, error } = await sb
    .from("rede_membros")
    .insert({
      crianca_id: id,
      tipo: b.tipo,
      nome,
      especialidade: texto(b.especialidade, 80),
      conselho: b.tipo === "profissional" ? texto(b.conselho, 40) : null,
      status: "convidado",
      convite_token_hash: hashToken(token),
      convite_expira_em: new Date(Date.now() + CONVITE_DIAS * 864e5).toISOString(),
      acesso_ate: ate,
      convidado_por: pessoaId,
    })
    .select("id")
    .single();
  if (error || !m) return NextResponse.json({ error: "Não deu para criar o convite agora." }, { status: 500 });
  const membroId = (m as { id: string }).id;
  await sb.from("rede_permissoes").insert(linhasDePermissao(membroId, permissoes));
  await sb.from("consentimentos").insert({
    crianca_id: id, membro_id: membroId, autorizado_por: pessoaId, acao: "concedeu",
    categorias: paraConsentimento(permissoes), ate, versao_termo: VERSAO_TERMO_REDE,
  });
  await logAction({ actorId: pessoaId, actorRole: "responsavel", action: "permission_change", resourceType: "rede_membro", resourceId: membroId, metadata: { acao: "convidou", tipo: b.tipo, categorias: permissoes.map((p) => p.categoria) }, req });
  return NextResponse.json({ ok: true, membro_id: membroId, link: linkDoConvite(token), expira_em_dias: CONVITE_DIAS }, { status: 201 });
}
