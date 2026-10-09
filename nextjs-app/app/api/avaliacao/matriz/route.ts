import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { podeAvaliar } from "@/lib/avaliacao-servidor";
import { lerSerie, type FonteMatriz } from "@/lib/matriz-avaliacao";
import { itensDaMatriz } from "@/lib/matriz-avaliacao-servidor";

/**
 * GET /api/avaliacao/matriz?componente=Matemática&serie=7º Ano (EFAF)&ano=6&fonte=bncc
 * Onda 17: os itens da matriz para o componente no ano de referência (pode ser abaixo da série,
 * quando há defasagem). EF → Matriz Omni; EM → Matriz do ENEM (ou BNCC, com fonte=bncc).
 */
export async function GET(req: Request) {
  const session = await getSession();
  if (!podeAvaliar(session)) return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  const q = new URL(req.url).searchParams;
  const componente = q.get("componente") || "";
  const serie = lerSerie(q.get("serie"));
  const anoQ = Number(q.get("ano"));
  const ano = anoQ >= 1 && anoQ <= 9 ? anoQ : serie.ano;
  if (serie.etapa === "EI") {
    return NextResponse.json({ etapa: "EI", itens: [], aviso: "Na Educação Infantil a avaliação é pela observação dos campos de experiência, no próprio PEI." });
  }
  const r = await itensDaMatriz({ componente, etapa: serie.etapa, ano, fonte: (q.get("fonte") as FonteMatriz) || undefined });
  if (!r) return NextResponse.json({ etapa: serie.etapa, itens: [], aviso: `Ainda não há matriz para ${componente || "este componente"} nesta etapa.` });
  return NextResponse.json({ etapa: serie.etapa, ano, ...r }, { headers: { "Cache-Control": "private, max-age=600" } });
}
