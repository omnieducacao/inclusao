import { NextResponse } from "next/server";
import { getSession, memberIdDaSessao } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";
import { logger } from "@/lib/logger";
import { estudanteParaAvaliar, semMigracaoAvaliacao } from "@/lib/avaliacao-servidor";
import { componenteOficial } from "@/lib/matriz-avaliacao";

/**
 * Onda 17 — avaliação processual: reabre os descritores da diagnóstica a cada período.
 * GET ?studentId=&disciplina= → registros do componente, do mais antigo ao mais novo
 * POST { studentId, disciplina, periodo (1–4), tipo_periodo, ano_letivo, diagnostica_id, descritores[{codigo, descritor, nivel, observacao}], observacao_geral }
 */
export async function GET(req: Request) {
  const session = await getSession();
  const q = new URL(req.url).searchParams;
  const r = await estudanteParaAvaliar(session, q.get("studentId"));
  if ("erro" in r) return r.erro;
  let consulta = getSupabase()
    .from("avaliacao_processual")
    .select("*")
    .eq("workspace_id", session!.workspace_id)
    .eq("student_id", r.estudante.id)
    .order("ano_letivo", { ascending: true })
    .order("bimestre", { ascending: true });
  const disc = q.get("disciplina");
  if (disc) consulta = consulta.eq("disciplina", componenteOficial(disc));
  const { data, error } = await consulta;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ registros: data || [] });
}

type Hab = { codigo?: string; descritor?: string; nivel?: number | null; observacao?: string };

export async function POST(req: Request) {
  const session = await getSession();
  const body = (await req.json().catch(() => ({}))) as {
    studentId?: string; disciplina?: string; periodo?: number; tipo_periodo?: string; ano_letivo?: number;
    diagnostica_id?: string | null; matriz?: string; matriz_versao?: string | null; descritores?: Hab[]; observacao_geral?: string;
  };
  const r = await estudanteParaAvaliar(session, body.studentId);
  if ("erro" in r) return r.erro;
  const disciplina = componenteOficial(body.disciplina || "");
  const periodo = Number(body.periodo);
  const tipo = ["bimestral", "trimestral", "semestral"].includes(body.tipo_periodo || "") ? body.tipo_periodo! : "bimestral";
  const max = tipo === "bimestral" ? 4 : tipo === "trimestral" ? 3 : 2;
  if (!disciplina || !(periodo >= 1 && periodo <= max)) return NextResponse.json({ error: "Escolha o componente e o período." }, { status: 400 });
  const ano = Number(body.ano_letivo) || new Date().getFullYear();
  const sb = getSupabase();

  // Nível anterior de verdade: o último registro antes deste período, ou a diagnóstica de origem
  const { data: anteriores } = await sb
    .from("avaliacao_processual")
    .select("bimestre, ano_letivo, habilidades")
    .eq("workspace_id", session!.workspace_id)
    .eq("student_id", r.estudante.id)
    .eq("disciplina", disciplina)
    .order("ano_letivo", { ascending: false })
    .order("bimestre", { ascending: false });
  const antes = (anteriores || []).filter((x: { ano_letivo: number; bimestre: number }) => x.ano_letivo < ano || (x.ano_letivo === ano && x.bimestre < periodo));
  let base: Map<string, number> = new Map();
  if (antes[0]) {
    base = new Map(((antes[0].habilidades || []) as Array<{ codigo_omni?: string; codigo_bncc?: string; nivel_atual?: number }>)
      .filter((h) => typeof h.nivel_atual === "number").map((h) => [String(h.codigo_omni || h.codigo_bncc), h.nivel_atual as number]));
  } else if (body.diagnostica_id) {
    const { data: diag } = await sb.from("avaliacoes_diagnosticas").select("descritores").eq("id", body.diagnostica_id).eq("workspace_id", session!.workspace_id).maybeSingle();
    base = new Map(((diag?.descritores || []) as Array<{ codigo: string; nivel: number | null }>).filter((d) => typeof d.nivel === "number").map((d) => [d.codigo, d.nivel as number]));
  }

  const habilidades = (body.descritores || []).slice(0, 20).filter((d) => d.codigo).map((d) => ({
    codigo_omni: d.codigo,
    codigo_bncc: d.codigo, // compatibilidade com as telas e relatórios antigos
    descricao: String(d.descritor || "").slice(0, 400),
    nivel_atual: typeof d.nivel === "number" && d.nivel >= 0 && d.nivel <= 4 ? Math.round(d.nivel) : null,
    nivel_anterior: base.get(String(d.codigo)) ?? null,
    observacao: String(d.observacao || "").slice(0, 600),
  }));
  if (!habilidades.length) return NextResponse.json({ error: "Nenhum descritor para registrar." }, { status: 400 });

  const registro = {
    workspace_id: session!.workspace_id,
    student_id: r.estudante.id,
    professor_id: memberIdDaSessao(session) || null,
    disciplina,
    bimestre: periodo,
    tipo_periodo: tipo,
    ano_letivo: ano,
    habilidades,
    observacao_geral: String(body.observacao_geral || "").slice(0, 2000),
    matriz: ["omni", "enem", "bncc"].includes(body.matriz || "") ? body.matriz : "omni",
    matriz_versao: body.matriz_versao || null,
    diagnostica_id: body.diagnostica_id || null,
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await sb
    .from("avaliacao_processual")
    .upsert(registro, { onConflict: "workspace_id,student_id,disciplina,bimestre,ano_letivo" })
    .select("id")
    .maybeSingle();
  if (error) {
    logger.error({ err: error }, "POST /api/avaliacao/processual");
    if (semMigracaoAvaliacao(error.message)) return NextResponse.json({ error: "Falta rodar o SQL da onda 17 no Supabase." }, { status: 503 });
    return NextResponse.json({ error: "Não deu para salvar agora." }, { status: 500 });
  }
  return NextResponse.json({ ok: true, id: data?.id });
}
