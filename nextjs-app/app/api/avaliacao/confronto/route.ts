import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";
import { semMigracaoAvaliacao } from "@/lib/avaliacao-servidor";
import { itensDaMatriz, itensLegado, maisParecido } from "@/lib/matriz-avaliacao-servidor";

/**
 * Onda 17 — confronto de qualidade: Matriz Omni × matriz antiga, lado a lado.
 * Só para a direção da escola (master) e a administração da plataforma.
 * GET ?componente=&ano= · POST { codigo_omni, ref_legado, veredito: melhor|igual|pior, comentario }
 */
async function admin() {
  const s = await getSession();
  if (!s || s.user_role === "family" || !(s.is_platform_admin || s.user_role === "master")) return null;
  return s;
}

export async function GET(req: Request) {
  const s = await admin();
  if (!s) return NextResponse.json({ error: "Só a administração usa o confronto." }, { status: 403 });
  const q = new URL(req.url).searchParams;
  const componente = q.get("componente") || "Matemática";
  const ano = Math.min(9, Math.max(1, Number(q.get("ano")) || 5));
  const omni = await itensDaMatriz({ componente, etapa: "EF", ano });
  const legado = ano >= 4 ? await itensLegado(componente, ano) : [];
  const codigos = (omni?.itens || []).map((i) => i.codigo);
  const { data: vereditos, error } = codigos.length
    ? await getSupabase().from("confronto_matriz").select("*").in("codigo_omni", codigos)
    : { data: [], error: null };
  const mapa = new Map((vereditos || []).map((v: { codigo_omni: string }) => [v.codigo_omni, v]));
  const pares = (omni?.itens || []).map((i) => {
    const p = maisParecido(i, legado);
    return { omni: i, legado: p && p.semelhanca > 0 ? p.item : null, semelhanca: p ? Math.round(p.semelhanca * 100) : 0, veredito: mapa.get(i.codigo) || null };
  });
  return NextResponse.json({
    componente, ano,
    resumo: {
      omni: omni?.itens.length || 0,
      legado: legado.length,
      legado_vazios: legado.filter((l) => !l.habilidade.trim()).length,
      omni_com_bncc: (omni?.itens || []).filter((i) => i.habilidades_bncc.length).length,
      omni_com_saeb: (omni?.itens || []).filter((i) => i.saeb.length).length,
    },
    pares,
    semMigracao: !!error && semMigracaoAvaliacao(error.message),
  });
}

export async function POST(req: Request) {
  const s = await admin();
  if (!s) return NextResponse.json({ error: "Só a administração usa o confronto." }, { status: 403 });
  const b = (await req.json().catch(() => ({}))) as { codigo_omni?: string; ref_legado?: string | null; veredito?: string; comentario?: string };
  if (!/^OMNI-[A-Z]{2}\d-D\d{2}$/.test(b.codigo_omni || "") || !["melhor", "igual", "pior"].includes(b.veredito || "")) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }
  const { error } = await getSupabase().from("confronto_matriz").upsert({
    codigo_omni: b.codigo_omni, ref_legado: b.ref_legado || null, veredito: b.veredito,
    comentario: String(b.comentario || "").slice(0, 600), avaliador: s.usuario_nome || null, updated_at: new Date().toISOString(),
  });
  if (error) return NextResponse.json({ error: semMigracaoAvaliacao(error.message) || /confronto/.test(error.message) ? "Falta rodar o SQL da onda 17." : "Não deu para salvar." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
