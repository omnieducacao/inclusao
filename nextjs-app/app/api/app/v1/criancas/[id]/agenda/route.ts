import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { pessoaDoPedido } from "@/lib/app/sessao";
import { acessoACrianca } from "@/lib/app/acesso";
import { CAMPOS_COMPROMISSO, dataBrasilia, lerCompromisso, ocorrencias, paraQuemVe, podeVer, type Compromisso } from "@/lib/app/agenda";
import { logAction } from "@/lib/audit";

/**
 * Frente 6 · onda 105 · a agenda da criança.
 * GET  ?de=AAAA-MM-DD&ate=AAAA-MM-DD (padrão: hoje até 35 dias) → { compromissos, ocorrencias }
 *      a família e o adolescente veem todos; o membro da rede, só os dele.
 * POST → só a família cria {titulo, tipo, inicio, duracao_min?, dia_inteiro?, local?, levar?, quem_leva?,
 *      observacao?, repete?, repete_ate?, membro_id?, lembrar_min?}.
 * Sem a migração 105 no banco: 503 "em breve" (o app mostra a agenda como chegando).
 */
type Ctx = { params: Promise<{ id: string }> };
const DATA = /^\d{4}-\d{2}-\d{2}$/;
const DIA = 86_400_000;

export async function GET(req: Request, ctx: Ctx) {
  const pessoaId = await pessoaDoPedido(req);
  if (!pessoaId) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const { id } = await ctx.params;
  const acesso = await acessoACrianca(pessoaId, id);
  if (!acesso) return NextResponse.json({ error: "Sem acesso a esta criança." }, { status: 403 });
  const u = new URL(req.url).searchParams;
  const de = DATA.test(u.get("de") || "") ? u.get("de")! : dataBrasilia(Date.now());
  let ate = DATA.test(u.get("ate") || "") ? u.get("ate")! : dataBrasilia(Date.now() + 35 * DIA);
  if (ate < de) return NextResponse.json({ error: "Período inválido." }, { status: 400 });
  if (Date.parse(ate) - Date.parse(de) > 400 * DIA) ate = dataBrasilia(Date.parse(de) + 400 * DIA);

  const { data, error } = await getSupabase().from("app_compromissos").select(CAMPOS_COMPROMISSO).eq("crianca_id", id).is("cancelado_em", null);
  if (error) return NextResponse.json({ error: "A agenda chega em breve.", em_breve: true }, { status: 503 });
  const visiveis = ((data as Compromisso[] | null) || []).filter((c) => podeVer(acesso, c));
  return NextResponse.json({
    compromissos: visiveis.map((c) => paraQuemVe(acesso, c)),
    ocorrencias: ocorrencias(visiveis, de, ate),
    pode_editar: acesso.papel === "responsavel",
    de, ate,
  });
}

export async function POST(req: Request, ctx: Ctx) {
  const pessoaId = await pessoaDoPedido(req);
  if (!pessoaId) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const { id } = await ctx.params;
  const acesso = await acessoACrianca(pessoaId, id);
  if (acesso?.papel !== "responsavel") return NextResponse.json({ error: "Só a família marca compromissos na agenda." }, { status: 403 });
  const dados = lerCompromisso((await req.json().catch(() => ({}))) as Record<string, unknown>);
  if ("erro" in dados) return NextResponse.json({ error: dados.erro }, { status: 400 });
  const sb = getSupabase();
  if (dados.membro_id) {
    const { data: m } = await sb.from("rede_membros").select("id").eq("id", dados.membro_id).eq("crianca_id", id).maybeSingle();
    if (!m) return NextResponse.json({ error: "Essa pessoa não está na rede desta criança." }, { status: 400 });
  }
  const { data: ativos, error: e1 } = await sb.from("app_compromissos").select("id").eq("crianca_id", id).is("cancelado_em", null);
  if (e1) return NextResponse.json({ error: "A agenda chega em breve.", em_breve: true }, { status: 503 });
  if (((ativos as unknown[] | null) || []).length >= 200) return NextResponse.json({ error: "Limite de compromissos ativos." }, { status: 400 });
  const agora = new Date().toISOString();
  const { data, error } = await sb
    .from("app_compromissos")
    .insert({ crianca_id: id, repete: "nao", duracao_min: 60, dia_inteiro: false, pulos: [], lembrar_min: [1440, 60], ...dados, criado_por: pessoaId, created_at: agora, updated_at: agora })
    .select("id")
    .single();
  if (error || !data) return NextResponse.json({ error: "Não deu para salvar agora." }, { status: 500 });
  const cid = (data as { id: string }).id;
  await logAction({ actorId: pessoaId, actorRole: "responsavel", action: "create", resourceType: "compromisso", resourceId: cid, metadata: { tipo: dados.tipo, repete: dados.repete ?? "nao" }, req });
  return NextResponse.json({ ok: true, id: cid }, { status: 201 });
}
