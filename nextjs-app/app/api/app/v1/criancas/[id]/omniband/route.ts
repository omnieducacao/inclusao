import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { pessoaDoPedido } from "@/lib/app/sessao";
import { acessoACrianca } from "@/lib/app/acesso";
import { logAction } from "@/lib/audit";
import {
  MAX_OBJETOS, CODIGO_UID, abrirSun, ehLinha, ehRotina, ehTipoObjeto, hashUid, lerLinkDoChip, linkDoObjeto, novoCodigo,
} from "@/lib/app/omniband";

/**
 * Frente 6 · Omniband da criança (só a família).
 * GET  → objetos ligados à criança e as últimas leituras por quem não tem conta.
 * POST → liga um objeto novo.
 *   chip "simples" (NTAG 213/215/216): o servidor cria o código e devolve o link que o app grava no chip.
 *   chip "ntag424": o app lê o link que o chip já gera (SUN) e manda em `link`; o servidor confere a
 *   assinatura, tira o UID e liga o chip pela impressão do UID (o UID nunca é guardado aberto).
 */
type Ctx = { params: Promise<{ id: string }> };

async function soFamilia(req: Request, ctx: Ctx) {
  const pessoaId = await pessoaDoPedido(req);
  if (!pessoaId) return { erro: NextResponse.json({ error: "Não autenticado." }, { status: 401 }) };
  const { id } = await ctx.params;
  const acesso = await acessoACrianca(pessoaId, id);
  if (!acesso || acesso.papel !== "responsavel") {
    return { erro: NextResponse.json({ error: "Só a família cuida da Omniband." }, { status: 403 }) };
  }
  return { pessoaId, criancaId: id };
}

function apresentar(o: Record<string, unknown>) {
  const { uid_hash: _u, contador: _c, ...resto } = o;
  return { ...resto, link: o.chip === "simples" ? linkDoObjeto(String(o.codigo)) : null };
}

export async function GET(req: Request, ctx: Ctx) {
  const r = await soFamilia(req, ctx);
  if ("erro" in r) return r.erro;
  const sb = getSupabase();
  const { data: objetos } = await sb
    .from("omniband_objetos")
    .select("id, tipo, rotina, linha, apelido, codigo, chip, uid_hash, contador, status, created_at, desativado_em")
    .eq("crianca_id", r.criancaId)
    .order("created_at", { ascending: false });
  const { data: leituras } = await sb
    .from("omniband_leituras")
    .select("id, objeto_id, created_at, localizacao_em")
    .eq("crianca_id", r.criancaId)
    .eq("quem", "anonimo")
    .order("created_at", { ascending: false })
    .limit(10);
  return NextResponse.json({
    objetos: ((objetos as Record<string, unknown>[] | null) || []).map(apresentar),
    leituras_sem_conta: leituras || [],
  });
}

export async function POST(req: Request, ctx: Ctx) {
  const r = await soFamilia(req, ctx);
  if ("erro" in r) return r.erro;
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  if (!ehTipoObjeto(b.tipo)) return NextResponse.json({ error: "Escolha pulseira, cordão, cartão ou adesivo." }, { status: 400 });
  const rotina = b.rotina === undefined || b.rotina === null ? null : ehRotina(b.rotina) ? b.rotina : undefined;
  if (rotina === undefined) return NextResponse.json({ error: "Rotina inválida." }, { status: 400 });
  if (b.tipo === "adesivo" && !rotina) return NextResponse.json({ error: "Diga para que rotina é o adesivo." }, { status: 400 });
  const linha = ehLinha(b.linha) ? b.linha : null;
  const apelido = typeof b.apelido === "string" && b.apelido.trim() ? b.apelido.trim().slice(0, 40) : null;
  const chip = b.chip === "ntag424" ? "ntag424" : "simples";

  const sb = getSupabase();
  const { data: ja } = await sb.from("omniband_objetos").select("id").eq("crianca_id", r.criancaId).eq("status", "ativo");
  if (((ja as unknown[] | null) || []).length >= MAX_OBJETOS) {
    return NextResponse.json({ error: `Até ${MAX_OBJETOS} objetos ativos por criança.` }, { status: 409 });
  }

  let uid_hash: string | null = null;
  let contador = 0;
  if (chip === "ntag424") {
    const link = lerLinkDoChip(b.link);
    const sun = link?.p && link.c ? abrirSun(link.p, link.c) : null;
    if (!sun) return NextResponse.json({ error: "Não reconhecemos este chip. Encoste de novo, sem afastar o celular." }, { status: 400 });
    uid_hash = hashUid(sun.uid);
    contador = sun.contador;
    const { data: usado } = await sb.from("omniband_objetos").select("id").eq("uid_hash", uid_hash).eq("status", "ativo");
    if (((usado as unknown[] | null) || []).length) {
      return NextResponse.json({ error: "Este chip já está ligado a uma criança. Desative lá primeiro." }, { status: 409 });
    }
  }

  const linhaNova = {
    crianca_id: r.criancaId,
    tipo: b.tipo,
    rotina,
    linha,
    apelido,
    codigo: chip === "ntag424" ? `${CODIGO_UID}-${novoCodigo()}` : novoCodigo(),
    chip,
    uid_hash,
    contador,
    status: "ativo",
    vinculado_por: r.pessoaId,
  };
  const { data, error } = await sb.from("omniband_objetos").insert(linhaNova).select("id").single();
  if (error || !data) return NextResponse.json({ error: "Não deu para ligar agora." }, { status: 500 });
  const id = (data as { id: string }).id;
  await logAction({ actorId: r.pessoaId, actorRole: "responsavel", action: "create", resourceType: "omniband", resourceId: id, metadata: { tipo: b.tipo, rotina, chip }, req });
  return NextResponse.json(
    { ok: true, objeto: apresentar({ id, ...linhaNova }), gravar: chip === "simples" ? linkDoObjeto(linhaNova.codigo) : null },
    { status: 201 },
  );
}
