import { NextResponse } from "next/server";
import { rateLimitIA } from "@/lib/rate-limit";
import { getSession, memberIdDaSessao } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";
import { logger } from "@/lib/logger";
import { estudanteParaAvaliar, semTabelaProvas } from "@/lib/avaliacao-servidor";
import { componenteOficial } from "@/lib/matriz-avaliacao";
import { itemPorCodigo } from "@/lib/matriz-avaliacao-servidor";
import { gerarItensDaProva } from "@/lib/prova-servidor";
import { ADAPTACOES_PADRAO, LETRAS, codigoCurto, type Adaptacoes, type ItemProva, type Prova, type RespostaItem } from "@/lib/prova";
import type { EngineId } from "@/lib/ai-engines";

/**
 * Onda 25 — prova em papel.
 * GET  ?id=  ou  ?studentId=&disciplina=&tipo=   → a prova (ou a mais recente do componente)
 * POST { studentId, disciplina, tipo, ano_referencia, codigos[], adaptacoes?, engine? } → a IA monta e grava
 * PATCH { id, itens?, adaptacoes?, respostas? } → revisão dos itens, impressão e correção
 */
const SEM_TABELA = "Falta rodar o SQL da onda 25 (tabela avaliacao_provas) no Supabase para guardar a prova.";

function paraProva(l: Record<string, unknown>): Prova {
  return {
    id: l.id as string,
    codigo_curto: l.codigo_curto as string,
    tipo: l.tipo as Prova["tipo"],
    student_id: l.student_id as string,
    disciplina: l.disciplina as string,
    ano_referencia: (l.ano_referencia as string) || null,
    descritores: (l.descritores as Prova["descritores"]) || [],
    itens: (l.itens as ItemProva[]) || [],
    adaptacoes: { ...ADAPTACOES_PADRAO, ...((l.adaptacoes as Adaptacoes) || {}) },
    respostas: (l.respostas as Record<string, RespostaItem>) || {},
    created_at: l.created_at as string,
    updated_at: l.updated_at as string,
  };
}

export async function GET(req: Request) {
  const session = await getSession();
  const q = new URL(req.url).searchParams;
  const sb = getSupabase();
  let consulta = sb.from("avaliacao_provas").select("*").eq("workspace_id", session?.workspace_id || "-");
  const id = q.get("id");
  if (id) consulta = consulta.eq("id", id);
  else {
    const r = await estudanteParaAvaliar(session, q.get("studentId"));
    if ("erro" in r) return r.erro;
    consulta = consulta.eq("student_id", r.estudante.id).eq("disciplina", componenteOficial(q.get("disciplina") || "")).eq("tipo", q.get("tipo") === "processual" ? "processual" : "diagnostica");
  }
  const { data, error } = await consulta.order("updated_at", { ascending: false }).limit(1).maybeSingle();
  if (error) {
    if (semTabelaProvas(error.message)) return NextResponse.json({ prova: null, aviso: SEM_TABELA });
    return NextResponse.json({ error: "Não deu para abrir a prova." }, { status: 500 });
  }
  if (data && id) {
    const r = await estudanteParaAvaliar(session, data.student_id as string);
    if ("erro" in r) return r.erro;
  }
  return NextResponse.json({ prova: data ? paraProva(data) : null });
}

export async function POST(req: Request) {
  const rl = await rateLimitIA(req); if (rl) return rl;
  const session = await getSession();
  const body = (await req.json().catch(() => ({}))) as {
    studentId?: string; disciplina?: string; tipo?: string; ano_referencia?: number; codigos?: string[]; adaptacoes?: Partial<Adaptacoes>; engine?: string;
  };
  const r = await estudanteParaAvaliar(session, body.studentId);
  if ("erro" in r) return r.erro;
  const disciplina = componenteOficial(body.disciplina || "");
  const ano = Number(body.ano_referencia) || r.serie.ano;
  const codigos = [...new Set((body.codigos || []).map(String))].slice(0, 10);
  if (!codigos.length) return NextResponse.json({ error: "Escolha os descritores da prova." }, { status: 400 });
  const itensMatriz = (await Promise.all(codigos.map((c) => itemPorCodigo(c, disciplina, r.serie.etapa, ano)))).filter((x): x is NonNullable<typeof x> => !!x);
  if (!itensMatriz.length) return NextResponse.json({ error: "Os descritores não estão na matriz." }, { status: 400 });
  const anoRotulo = ano ? (r.serie.etapa === "EM" ? `${ano}ª série` : `${ano}º ano`) : null;

  let itens: ItemProva[];
  try {
    const engine = (["red", "blue", "green", "yellow", "orange"].includes(body.engine || "") ? body.engine : "red") as EngineId;
    itens = await gerarItensDaProva({ estudante: r.estudante, disciplina, ano: anoRotulo, itens: itensMatriz, workspaceId: session!.workspace_id as string, engine });
  } catch (e) {
    logger.error({ err: e }, "POST /api/avaliacao/prova (IA)");
    return NextResponse.json({ error: "A IA não conseguiu montar a prova agora. Tente de novo em instantes." }, { status: 502 });
  }
  if (itens.length < itensMatriz.length) {
    return NextResponse.json({ error: "A prova veio incompleta. Tente gerar de novo." }, { status: 502 });
  }
  // ordem da prova: descritor a descritor, o item com apoio antes
  const ordem = new Map(itensMatriz.map((i, k) => [i.codigo, k]));
  itens.sort((a, b) => (ordem.get(a.codigo)! - ordem.get(b.codigo)!) || a.ordem - b.ordem);

  const agora = new Date().toISOString();
  const registro = {
    workspace_id: session!.workspace_id,
    student_id: r.estudante.id,
    tipo: body.tipo === "processual" ? "processual" : "diagnostica",
    disciplina,
    ano_referencia: anoRotulo,
    codigo_curto: codigoCurto(),
    descritores: itensMatriz.map((i) => ({ codigo: i.codigo, descritor: i.descritor })),
    itens,
    adaptacoes: { ...ADAPTACOES_PADRAO, ...(body.adaptacoes || {}) },
    respostas: {},
    criada_por: memberIdDaSessao(session) || null,
    created_at: agora,
    updated_at: agora,
  };
  const { data, error } = await getSupabase().from("avaliacao_provas").insert(registro).select("*").maybeSingle();
  if (error) {
    logger.error({ err: error }, "POST /api/avaliacao/prova");
    if (semTabelaProvas(error.message)) {
      // sem a tabela, a prova ainda serve para imprimir agora (não fica guardada)
      return NextResponse.json({ prova: paraProva({ ...registro, id: `temp-${registro.codigo_curto}` }), aviso: SEM_TABELA });
    }
    return NextResponse.json({ error: "A prova foi montada, mas não deu para guardar. Tente de novo." }, { status: 500 });
  }
  return NextResponse.json({ prova: paraProva(data!) });
}

function itensValidos(itens: unknown): ItemProva[] | null {
  if (!Array.isArray(itens)) return null;
  const ok = itens.every((i: ItemProva) => i && typeof i.id === "string" && typeof i.codigo === "string" && typeof i.enunciado === "string"
    && (i.tipo !== "objetiva" || (Array.isArray(i.alternativas) && i.alternativas.length >= 2 && LETRAS.includes(i.gabarito!))));
  return ok ? (itens as ItemProva[]).slice(0, 21) : null;
}

function respostasValidas(resp: unknown): Record<string, RespostaItem> | null {
  if (!resp || typeof resp !== "object") return null;
  const saida: Record<string, RespostaItem> = {};
  for (const [k, v] of Object.entries(resp as Record<string, RespostaItem>)) {
    if (!v || !["nenhum", "leve", "total"].includes(v.apoio)) continue;
    saida[k] = {
      apoio: v.apoio,
      fonte: ["grade", "foto", "rubrica", "ia"].includes(v.fonte) ? v.fonte : "grade",
      ...(v.marcada === null || LETRAS.includes(v.marcada as never) ? { marcada: v.marcada ?? null } : {}),
      ...(typeof v.nivel === "number" && v.nivel >= 0 && v.nivel <= 4 ? { nivel: Math.round(v.nivel) } : {}),
      ...(v.conferir ? { conferir: true } : {}),
      ...(v.nota_ia ? { nota_ia: String(v.nota_ia).slice(0, 400) } : {}),
    };
  }
  return saida;
}

export async function PATCH(req: Request) {
  const session = await getSession();
  const body = (await req.json().catch(() => ({}))) as { id?: string; itens?: unknown; adaptacoes?: Partial<Adaptacoes>; respostas?: unknown };
  if (!body.id || body.id.startsWith("temp-")) return NextResponse.json({ error: SEM_TABELA }, { status: 400 });
  const sb = getSupabase();
  const { data: atual, error: e1 } = await sb.from("avaliacao_provas").select("id, student_id").eq("id", body.id).eq("workspace_id", session?.workspace_id || "-").maybeSingle();
  if (e1 || !atual) return NextResponse.json({ error: "Prova não encontrada." }, { status: 404 });
  const r = await estudanteParaAvaliar(session, atual.student_id as string);
  if ("erro" in r) return r.erro;

  const mudanca: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.itens !== undefined) {
    const itens = itensValidos(body.itens);
    if (!itens) return NextResponse.json({ error: "Os itens da prova vieram com erro." }, { status: 400 });
    mudanca.itens = itens;
  }
  if (body.adaptacoes) mudanca.adaptacoes = { ...ADAPTACOES_PADRAO, ...body.adaptacoes };
  if (body.respostas !== undefined) {
    const resp = respostasValidas(body.respostas);
    if (!resp) return NextResponse.json({ error: "As respostas vieram com erro." }, { status: 400 });
    mudanca.respostas = resp;
  }
  const { data, error } = await sb.from("avaliacao_provas").update(mudanca).eq("id", body.id).select("*").maybeSingle();
  if (error) return NextResponse.json({ error: "Não deu para salvar a prova." }, { status: 500 });
  return NextResponse.json({ prova: paraProva(data!) });
}
