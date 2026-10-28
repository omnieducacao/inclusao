import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { pessoaDoPedido } from "@/lib/app/sessao";
import { acessoACrianca } from "@/lib/app/acesso";
import { logAction } from "@/lib/audit";
import { acharObjeto, lerLinkDoChip, montarLink, sugestaoDaRotina } from "@/lib/app/omniband";

/**
 * Frente 6 · alguém logado no app encostou o celular numa Omniband (ou abriu o link dela).
 * POST { link } ou { codigo, p?, c? }
 *   ok           → a criança, o objeto e a tela que o app deve abrir (com o que a pessoa pode ver e escrever)
 *   sem_acesso   → a pessoa não está na rede desta criança: o app mostra a página de ajuda, como para qualquer um
 *   desativada   → a família desativou este objeto (só a família fica sabendo qual é)
 *   desconhecida → link que não é de nenhuma Omniband (ou link copiado de um chip que não se copia)
 */
export async function POST(req: Request) {
  const pessoaId = await pessoaDoPedido(req);
  if (!pessoaId) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const link =
    lerLinkDoChip(b.link) ||
    (typeof b.codigo === "string" ? montarLink(b.codigo, typeof b.p === "string" ? b.p : null, typeof b.c === "string" ? b.c : null) : null);
  if (!link) return NextResponse.json({ estado: "desconhecida" }, { status: 404 });

  const achado = await acharObjeto(link);
  if (!achado) return NextResponse.json({ estado: "desconhecida" }, { status: 404 });
  const { objeto } = achado;
  const acesso = await acessoACrianca(pessoaId, objeto.crianca_id);
  if (!acesso) return NextResponse.json({ estado: "sem_acesso" });
  if (objeto.status !== "ativo") {
    return acesso.papel === "responsavel"
      ? NextResponse.json({ estado: "desativada", objeto: { id: objeto.id, tipo: objeto.tipo, apelido: objeto.apelido }, crianca_id: objeto.crianca_id })
      : NextResponse.json({ estado: "desconhecida" }, { status: 404 });
  }

  const sb = getSupabase();
  const { data: c } = await sb.from("criancas").select("id, nome").eq("id", objeto.crianca_id).maybeSingle();
  await sb.from("omniband_leituras").insert({
    objeto_id: objeto.id,
    crianca_id: objeto.crianca_id,
    quem: acesso.papel,
    pessoa_id: pessoaId,
    contador: objeto.contador,
  });
  await logAction({ actorId: pessoaId, actorRole: acesso.papel, action: "view", resourceType: "omniband_toque", resourceId: objeto.id, req });
  return NextResponse.json({
    estado: "ok",
    crianca: c ? { id: (c as { id: string }).id, nome: (c as { nome: string }).nome } : { id: objeto.crianca_id, nome: "" },
    objeto: { id: objeto.id, tipo: objeto.tipo, rotina: objeto.rotina, apelido: objeto.apelido },
    sugestao: sugestaoDaRotina(objeto.rotina),
    papel: acesso.papel,
    pode_ver: [...acesso.ver],
    pode_escrever: [...acesso.escrever],
  });
}
