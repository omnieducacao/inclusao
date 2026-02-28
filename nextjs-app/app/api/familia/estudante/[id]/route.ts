import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";

/**
 * GET /api/familia/estudante/[id]
 * Retorna dados do estudante para o responsável (apenas se vinculado).
 * Dados limitados: básicos, resumo PEI, evolução processual.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.workspace_id || session.user_role !== "family") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const familyId = session.family_responsible_id;
  if (!familyId) {
    return NextResponse.json({ error: "Sessão inválida" }, { status: 401 });
  }

  const { id: studentId } = await params;

  const sb = getSupabase();

  const { data: link } = await sb
    .from("family_student_links")
    .select("id")
    .eq("family_responsible_id", familyId)
    .eq("student_id", studentId)
    .maybeSingle();

  if (!link) {
    return NextResponse.json({ error: "Estudante não vinculado" }, { status: 403 });
  }

  const { data: student, error: studentError } = await sb
    .from("students")
    .select("id, name, grade, class_group, pei_data, paee_data, paee_ciclos, planejamento_ativo")
    .eq("id", studentId)
    .eq("workspace_id", session.workspace_id)
    .single();

  if (studentError || !student) {
    return NextResponse.json({ error: "Estudante não encontrado" }, { status: 404 });
  }

  const peiData = (student.pei_data || {}) as Record<string, unknown>;
  const paeeData = (student.paee_data || {}) as Record<string, unknown>;
  const paeeCiclos = (student.paee_ciclos || []) as Array<{ ciclo_id?: string; config_ciclo?: { data_inicio?: string; data_fim?: string; foco_principal?: string } }>;
  const planejamentoAtivo = student.planejamento_ativo;
  const paeeAtivo = planejamentoAtivo
    ? paeeCiclos.find((c) => c.ciclo_id === planejamentoAtivo)
    : null;

  const { data: processualData } = await sb
    .from("avaliacao_processual")
    .select("disciplina, bimestre, habilidades")
    .eq("student_id", studentId)
    .eq("workspace_id", session.workspace_id)
    .order("bimestre", { ascending: true });

  const registros = processualData || [];
  const disciplinas = [...new Set(registros.map((r: { disciplina: string }) => r.disciplina))];
  const { data: ack } = await sb
    .from("family_pei_acknowledgments")
    .select("id, acknowledged_at")
    .eq("family_responsible_id", familyId)
    .eq("student_id", studentId)
    .maybeSingle();

  const evolucaoPorDisciplina = disciplinas.map((disc: string) => {
    const regs = registros
      .filter((r: { disciplina: string }) => r.disciplina === disc)
      .sort((a: { bimestre: number }, b: { bimestre: number }) => a.bimestre - b.bimestre);
    const habs = regs.flatMap((r: { habilidades?: Array<{ nivel_atual?: number }> }) => r.habilidades || []);
    const medias = regs.map((r: { habilidades?: Array<{ nivel_atual?: number }> }) => {
      const h = r.habilidades || [];
      return h.length > 0 ? h.reduce((acc: number, x: { nivel_atual?: number }) => acc + (x.nivel_atual || 0), 0) / h.length : null;
    }).filter((m: number | null) => m !== null) as number[];
    const mediaRecente = medias.length > 0 ? Math.round(medias[medias.length - 1] * 10) / 10 : null;
    return { disciplina: disc, periodos: regs.length, media_mais_recente: mediaRecente };
  });

  return NextResponse.json({
    estudante: {
      id: student.id,
      name: student.name,
      grade: student.grade,
      class_group: student.class_group,
    },
    pei_resumo: {
      nome: peiData.nome,
      serie: peiData.serie,
      turma: peiData.turma,
      ia_sugestao: typeof peiData.ia_sugestao === "string" ? peiData.ia_sugestao.substring(0, 500) : null,
    },
    paee_resumo: paeeAtivo
      ? {
          periodo: paeeAtivo.config_ciclo
            ? `${paeeAtivo.config_ciclo.data_inicio || ""} a ${paeeAtivo.config_ciclo.data_fim || ""}`
            : null,
          foco: paeeAtivo.config_ciclo?.foco_principal,
        }
      : null,
    evolucao: { evolucao: evolucaoPorDisciplina },
    ciencia_pei: ack
      ? { acknowledged: true, acknowledged_at: ack.acknowledged_at }
      : { acknowledged: false, acknowledged_at: null },
  });
}
