import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { pessoaDoPedido } from "@/lib/app/sessao";
import { acessoACrianca, categoriaDoRegistro, type Categoria } from "@/lib/app/acesso";
import { logAction } from "@/lib/audit";
import { avaliarConquistas } from "@/lib/app/conquistas";
import { ehUuid } from "@/lib/app/acesso";

/**
 * Frente 6 · linha do tempo da criança.
 * GET  → registros das categorias que esta pessoa pode ver (mais novos primeiro; ?ate=<iso> pagina)
 * POST → novo registro, se a pessoa pode escrever na categoria. `id_local` (gerado no celular sem
 *        internet) evita duplicar quando o app reenviar o mesmo registro.
 * O app só registra; nunca sugere dose nem diagnóstico (Anvisa, RDC 657/2022).
 * `objeto_id` (onda 101): o registro veio de um toque na Omniband; origem "pulseira".
 */
const TIPOS = new Set(["evento", "dose", "medicacao", "terapia", "orientacao", "humor", "sinal"]);
const LOCAIS = new Set(["casa", "escola", "terapia", "rua", "outro"]);
const SUBTIPOS_EVENTO = new Set([
  "crise", "agitacao", "apatia", "agressividade", "choro", "autolesao", "sono", "alimentacao", "avanco",
  // Omniband (onda 101): adesivos de rotina e chegada/saída da escola pelo crachá ou pela pulseira
  "banho", "calma", "chegada", "saida",
]);
const POR_PAGINA = 50;

type Ctx = { params: Promise<{ id: string }> };

function texto(x: unknown, max: number): string | null {
  return typeof x === "string" && x.trim() ? x.trim().slice(0, max) : null;
}

export async function GET(req: Request, ctx: Ctx) {
  const pessoaId = await pessoaDoPedido(req);
  if (!pessoaId) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const { id } = await ctx.params;
  const acesso = await acessoACrianca(pessoaId, id);
  if (!acesso || !acesso.ver.size) return NextResponse.json({ error: "Sem acesso a esta criança." }, { status: 403 });

  const url = new URL(req.url);
  const ate = url.searchParams.get("ate");
  let q = getSupabase()
    .from("registros")
    .select("id, tipo, categoria, subtipo, quando, fim, intensidade, duracao, gatilho, local, texto, dados, autor_pessoa_id, origem, created_at")
    .eq("crianca_id", id)
    .is("apagado_em", null)
    .in("categoria", [...acesso.ver])
    .order("quando", { ascending: false })
    .limit(POR_PAGINA);
  if (ate && !Number.isNaN(Date.parse(ate))) q = q.lt("quando", new Date(ate).toISOString());
  const { data, error } = await q;
  if (error) return NextResponse.json({ error: "Não deu para carregar a linha do tempo." }, { status: 500 });

  // O responsável vê o humor do adolescente só como dia bom/difícil, sem a frase.
  const linhas = ((data as Record<string, unknown>[] | null) || []).map((r) =>
    acesso.papel === "responsavel" && r.tipo === "humor" && r.autor_pessoa_id !== pessoaId ? { ...r, texto: null } : r,
  );
  await logAction({ actorId: pessoaId, actorRole: acesso.papel, action: "view", resourceType: "linha_do_tempo", resourceId: id, req });
  return NextResponse.json({ registros: linhas, mais: linhas.length === POR_PAGINA });
}

export async function POST(req: Request, ctx: Ctx) {
  const pessoaId = await pessoaDoPedido(req);
  if (!pessoaId) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const { id } = await ctx.params;
  const acesso = await acessoACrianca(pessoaId, id);
  if (!acesso) return NextResponse.json({ error: "Sem acesso a esta criança." }, { status: 403 });

  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const tipo = typeof b.tipo === "string" ? b.tipo : "";
  const local = typeof b.local === "string" && LOCAIS.has(b.local) ? b.local : null;
  if (!TIPOS.has(tipo)) return NextResponse.json({ error: "Tipo de registro inválido." }, { status: 400 });
  const subtipo = texto(b.subtipo, 40);
  if (tipo === "evento" && (!subtipo || !SUBTIPOS_EVENTO.has(subtipo))) {
    return NextResponse.json({ error: "Escolha o que aconteceu." }, { status: 400 });
  }
  const intensidade = typeof b.intensidade === "number" && Number.isInteger(b.intensidade) && b.intensidade >= 1 && b.intensidade <= 5 ? b.intensidade : null;
  const quando = typeof b.quando === "string" && !Number.isNaN(Date.parse(b.quando)) ? new Date(b.quando) : new Date();
  if (quando.getTime() > Date.now() + 5 * 60_000) return NextResponse.json({ error: "A data não pode ser no futuro." }, { status: 400 });

  const categoria = categoriaDoRegistro(tipo, local) as Categoria;
  if (!acesso.escrever.has(categoria)) {
    return NextResponse.json({ error: "Você não pode registrar isso para esta criança." }, { status: 403 });
  }

  const linha = {
    crianca_id: id,
    tipo,
    categoria,
    subtipo,
    quando: quando.toISOString(),
    intensidade,
    duracao: texto(b.duracao, 40),
    gatilho: texto(b.gatilho, 80),
    local,
    texto: texto(b.texto, 1000),
    autor_pessoa_id: pessoaId,
    autor_membro_id: acesso.membroId || null,
    origem: "app",
    id_local: texto(b.id_local, 64),
  };
  const sb = getSupabase();
  if (ehUuid(b.objeto_id)) {
    const { data: obj } = await sb.from("omniband_objetos").select("id").eq("id", b.objeto_id).eq("crianca_id", id).maybeSingle();
    if (obj) Object.assign(linha, { origem: "pulseira", dados: { objeto_id: b.objeto_id } });
  }
  if (linha.id_local) {
    const { data: ja } = await sb.from("registros").select("id").eq("crianca_id", id).eq("id_local", linha.id_local).maybeSingle();
    if (ja) return NextResponse.json({ ok: true, id: (ja as { id: string }).id, repetido: true });
  }
  const { data, error } = await sb.from("registros").insert(linha).select("id").single();
  if (error || !data) return NextResponse.json({ error: "Não deu para registrar agora." }, { status: 500 });
  await logAction({ actorId: pessoaId, actorRole: acesso.papel, action: "create", resourceType: "registro", resourceId: (data as { id: string }).id, metadata: { tipo, categoria }, req });
  // o humor conta para a conquista "10 dias me ouvindo"
  const conquistas_novas = tipo === "humor" ? await avaliarConquistas(id) : [];
  return NextResponse.json({ ok: true, id: (data as { id: string }).id, conquistas_novas }, { status: 201 });
}
