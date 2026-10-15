import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { getSupabase } from "@/lib/supabase";
import { ehRobo } from "@/lib/leads";
import { hashDoIp } from "@/lib/leads-server";
import { TRILHAS, gerarCodigo, temasDaTrilha, validarPedido } from "@/lib/certificado";

const LIMITE_POR_HORA = 5;

/**
 * Emite o certificado de conclusão da formação (onda 53). Rota pública: está em PUBLIC_PATHS no proxy.ts.
 * O site libera o formulário quando a pessoa respondeu às perguntas de todos os temas da trilha.
 * Grava um contato (lead, origem "certificado") e o certificado, e devolve o endereço da página do certificado.
 */
export async function POST(req: Request) {
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Não foi possível ler o formulário." }, { status: 400 }); }
  if (ehRobo(body)) return NextResponse.json({ ok: true });
  const v = validarPedido(body);
  if (!v.ok) return NextResponse.json({ error: "Confira os campos marcados.", erros: v.erros }, { status: 400 });
  const { pedido } = v;
  const trilha = TRILHAS[pedido.trilha];
  try {
    const sb = getSupabase();
    const ip_hash = hashDoIp(req);
    if (ip_hash) {
      const desde = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { count } = await sb.from("certificados").select("id", { count: "exact", head: true }).eq("ip_hash", ip_hash).gte("emitido_em", desde);
      if ((count || 0) >= LIMITE_POR_HORA) {
        return NextResponse.json({ error: "Recebemos vários pedidos deste endereço. Tente de novo em uma hora." }, { status: 429 });
      }
    }
    const { data: lead, error: erroLead } = await sb.from("leads").insert({
      nome: pedido.nome, email: pedido.email, telefone: pedido.telefone, escola: pedido.escola,
      cargo: trilha.cargo, origem: "certificado", papel_demo: trilha.nome,
      mensagem: `Mudança que vai fazer na aula: ${pedido.reflexao}`,
      consentimento_em: new Date().toISOString(), ip_hash,
    }).select("id").single();
    // O contato é bônus: se não gravar, o certificado sai do mesmo jeito
    if (erroLead) logger.warn({ err: erroLead }, "certificado: contato não gravado");

    // Código único: tenta de novo nas raras colisões
    for (let i = 0; i < 4; i++) {
      const codigo = gerarCodigo();
      const { error } = await sb.from("certificados").insert({
        codigo, nome: pedido.nome, email: pedido.email, escola: pedido.escola, telefone: pedido.telefone,
        trilha: pedido.trilha, horas: trilha.horas, temas: temasDaTrilha(pedido.trilha).map((t) => t.slug),
        lead_id: lead?.id ?? null, ip_hash, reflexao: pedido.reflexao,
      });
      if (!error) return NextResponse.json({ ok: true, codigo, redirect: `/certificado/${codigo}` });
      if (error.code !== "23505") throw error;
    }
    throw new Error("não foi possível gerar um código único");
  } catch (err) {
    logger.error({ err }, "POST /api/public/certificado");
    return NextResponse.json({ error: "Não conseguimos emitir agora. Tente de novo em alguns minutos." }, { status: 500 });
  }
}
