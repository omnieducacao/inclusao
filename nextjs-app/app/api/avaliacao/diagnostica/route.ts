import { NextResponse } from "next/server";
import { getSession, memberIdDaSessao } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";
import { logger } from "@/lib/logger";
import { estudanteParaAvaliar, semMigracaoAvaliacao } from "@/lib/avaliacao-servidor";
import { componenteOficial, nivelDoComponente, type DescritorAvaliado, type FonteMatriz } from "@/lib/matriz-avaliacao";
import { itemPorCodigo, versaoMatrizOmni } from "@/lib/matriz-avaliacao-servidor";

/**
 * Onda 17 — avaliação diagnóstica por descritor.
 * GET ?studentId= → as diagnósticas do estudante (novas e antigas, marcadas como legado)
 * POST { studentId, disciplina, ano_referencia, fonte, descritores[], concluir?, id? }
 *   grava (ou continua) a diagnóstica do componente; ao concluir, o nível do componente é a
 *   mediana dos descritores e os de nível 0–2 aparecem no PEI como sugestão de meta.
 */
export async function GET(req: Request) {
  const session = await getSession();
  const studentId = new URL(req.url).searchParams.get("studentId");
  const r = await estudanteParaAvaliar(session, studentId);
  if ("erro" in r) return r.erro;
  const { data, error } = await getSupabase()
    .from("avaliacoes_diagnosticas")
    .select("*")
    .eq("workspace_id", session!.workspace_id)
    .eq("student_id", studentId)
    .order("updated_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const avaliacoes = (data || []).map((a: Record<string, unknown>) => ({
    id: a.id,
    disciplina: a.disciplina,
    matriz: (a.matriz as string) || "legado",
    matriz_versao: a.matriz_versao || null,
    ano_referencia: a.ano_referencia || null,
    descritores: Array.isArray(a.descritores) ? a.descritores : [],
    nivel: a.nivel_omnisfera_identificado ?? null,
    status: a.status,
    concluida_em: a.concluida_em || null,
    updated_at: a.updated_at,
    // registros antigos: quantas habilidades a matriz antiga avaliou
    legado_habilidades: Array.isArray(a.habilidades_bncc) ? (a.habilidades_bncc as unknown[]).length : 0,
  }));
  return NextResponse.json({ avaliacoes, serie: r.serie });
}

export async function POST(req: Request) {
  const session = await getSession();
  const body = (await req.json().catch(() => ({}))) as {
    id?: string; studentId?: string; disciplina?: string; ano_referencia?: number; fonte?: FonteMatriz;
    descritores?: DescritorAvaliado[]; concluir?: boolean;
  };
  const r = await estudanteParaAvaliar(session, body.studentId);
  if ("erro" in r) return r.erro;
  const disciplina = componenteOficial(body.disciplina || "");
  if (!disciplina) return NextResponse.json({ error: "Escolha o componente." }, { status: 400 });
  if (r.serie.etapa === "EI") return NextResponse.json({ error: "Na Educação Infantil a avaliação é feita no PEI." }, { status: 400 });

  const anoRef = Number(body.ano_referencia) || r.serie.ano;
  // Só entra o que existe na matriz: o texto vem do servidor, não da tela
  const descritores: DescritorAvaliado[] = [];
  const bncc = new Set<string>();
  for (const d of (body.descritores || []).slice(0, 15)) {
    const item = await itemPorCodigo(String(d.codigo || ""), disciplina, r.serie.etapa, anoRef);
    if (!item) continue;
    item.habilidades_bncc.forEach((h) => bncc.add(h));
    const nivel = typeof d.nivel === "number" && d.nivel >= 0 && d.nivel <= 4 ? Math.round(d.nivel) : null;
    descritores.push({
      codigo: item.codigo, descritor: item.descritor, eixo: item.eixo, nivel,
      evidencia_observada: String(d.evidencia_observada || "").slice(0, 600),
      fonte: d.fonte === "itens" ? "itens" : "observacao",
    });
  }
  if (!descritores.length) return NextResponse.json({ error: "Escolha pelo menos um descritor da matriz." }, { status: 400 });
  if (body.concluir && descritores.some((d) => d.nivel === null)) {
    return NextResponse.json({ error: "Marque o nível de todos os descritores para concluir." }, { status: 400 });
  }

  const fonte: FonteMatriz = r.serie.etapa === "EM" ? (body.fonte === "bncc" ? "bncc" : "enem") : "omni";
  const agora = new Date().toISOString();
  const memberId = memberIdDaSessao(session);
  const registro: Record<string, unknown> = {
    workspace_id: session!.workspace_id,
    student_id: r.estudante.id,
    disciplina,
    matriz: fonte,
    matriz_versao: fonte === "omni" ? await versaoMatrizOmni() : fonte === "enem" ? "enem-inep" : "bncc",
    ano_referencia: anoRef ? (r.serie.etapa === "EM" ? `${anoRef}ª série` : `${anoRef}º ano`) : null,
    descritores,
    nivel_omnisfera_identificado: nivelDoComponente(descritores),
    habilidades_bncc: [...bncc],
    status: body.concluir ? "aplicada" : "em_andamento",
    concluida_em: body.concluir ? agora : null,
    updated_at: agora,
  };

  const sb = getSupabase();
  let id = body.id || null;
  if (!id) {
    // continua a diagnóstica aberta deste componente, se houver
    const { data: aberta } = await sb
      .from("avaliacoes_diagnosticas")
      .select("id")
      .eq("workspace_id", session!.workspace_id)
      .eq("student_id", r.estudante.id)
      .eq("disciplina", disciplina)
      .neq("matriz", "legado")
      .is("concluida_em", null)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    id = (aberta?.id as string) || null;
  }

  const res = id
    ? await sb.from("avaliacoes_diagnosticas").update(registro).eq("id", id).eq("workspace_id", session!.workspace_id).select("id").maybeSingle()
    : await sb.from("avaliacoes_diagnosticas").insert({ ...registro, criada_por: memberId || null, professor_regente_id: memberId || null, created_at: agora }).select("id").maybeSingle();

  if (res.error) {
    logger.error({ err: res.error }, "POST /api/avaliacao/diagnostica");
    if (semMigracaoAvaliacao(res.error.message)) {
      return NextResponse.json({ error: "Falta rodar o SQL da onda 17 no Supabase para gravar a avaliação nova." }, { status: 503 });
    }
    return NextResponse.json({ error: "Não deu para salvar a avaliação agora." }, { status: 500 });
  }
  return NextResponse.json({ ok: true, id: res.data?.id, nivel: registro.nivel_omnisfera_identificado, concluida: !!body.concluir });
}
