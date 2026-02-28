import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";

/**
 * GET /api/pei/relatorio-transicao?studentId=X&ano=2024
 * Gera relatório de transição entre anos: diagnóstica final, processual último bimestre,
 * metas atingidas, recomendações para o próximo ano.
 */
export async function GET(req: Request) {
  const session = await getSession();
  if (!session?.workspace_id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("studentId");
  const ano = searchParams.get("ano") || String(new Date().getFullYear());

  if (!studentId) {
    return NextResponse.json({ error: "studentId é obrigatório" }, { status: 400 });
  }

  const sb = getSupabase();

  const { data: student, error: studentError } = await sb
    .from("students")
    .select("id, name, grade, class_group, pei_data, paee_ciclos")
    .eq("id", studentId)
    .eq("workspace_id", session.workspace_id)
    .single();

  if (studentError || !student) {
    return NextResponse.json({ error: "Estudante não encontrado" }, { status: 404 });
  }

  const peiData = (student.pei_data || {}) as Record<string, unknown>;
  const anoNum = parseInt(ano, 10);

  // Avaliações diagnósticas do ano
  const { data: diagnosticas } = await sb
    .from("avaliacoes_diagnosticas")
    .select("disciplina, nivel_omnisfera_identificado, status, created_at")
    .eq("student_id", studentId)
    .eq("workspace_id", session.workspace_id)
    .order("created_at", { ascending: false });

  // Avaliação processual - último bimestre do ano
  const { data: processual } = await sb
    .from("avaliacao_processual")
    .select("disciplina, bimestre, habilidades, observacao_geral")
    .eq("student_id", studentId)
    .eq("workspace_id", session.workspace_id)
    .eq("ano_letivo", anoNum)
    .order("bimestre", { ascending: false });

  const ultimoBimestre = processual?.length
    ? Math.max(...(processual?.map((p: { bimestre: number }) => p.bimestre) || []))
    : null;
  const processualUltimoBim = processual?.filter(
    (p: { bimestre: number }) => p.bimestre === ultimoBimestre
  ) || [];

  // Metas do PEI (status_meta em pei_disciplinas ou pei_data)
  const metasPei = (peiData.metas as Array<{ objetivo?: string; status?: string }>) || [];
  const metasAtingidas = metasPei.filter((m) => m.status === "atingida" || m.status === "atingido");
  const metasParciais = metasPei.filter((m) => m.status === "parcial" || m.status === "em_andamento");

  const relatorio = {
    estudante: {
      id: student.id,
      name: student.name,
      grade: student.grade,
      class_group: student.class_group,
    },
    ano_letivo: anoNum,
    diagnóstica: diagnosticas || [],
    processual_ultimo_bimestre: {
      bimestre: ultimoBimestre,
      registros: processualUltimoBim.map((r: { disciplina: string; habilidades?: Array<{ nivel_atual?: number }> }) => {
        const habs = r.habilidades || [];
        const media = habs.length > 0
          ? Math.round(habs.reduce((acc: number, h: { nivel_atual?: number }) => acc + (h.nivel_atual || 0), 0) / habs.length * 10) / 10
          : null;
        return { disciplina: r.disciplina, media_nivel: media };
      }),
    },
    metas: {
      total: metasPei.length,
      atingidas: metasAtingidas.length,
      parciais: metasParciais.length,
      lista: metasPei,
    },
    recomendacoes: (peiData.proximos_passos as string) || (peiData.recomendacoes as string) || null,
    gerado_em: new Date().toISOString(),
  };

  return NextResponse.json(relatorio);
}
