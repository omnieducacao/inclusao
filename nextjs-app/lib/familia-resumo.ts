import { getSupabase } from "@/lib/supabase";
import { logger } from "@/lib/logger";
import { snapshotDaVersao } from "@/lib/familia-caixa";

/**
 * O que a escola mostra à família de um estudante (onda 102): o mesmo cálculo serve ao site
 * (/api/familia/estudante/[id]) e ao app (/api/app/v1/criancas/[id]/escola).
 * Só o que a coordenação liberou: o resumo do PEI escrito para a família, a evolução por
 * disciplina e o período do PAEE. Nada de texto técnico, foco clínico ou diagnóstico.
 */
export type ResumoParaFamilia = {
  estudante: { id: string; name: string; grade: string | null; class_group: string | null };
  pei_resumo: { nome: unknown; serie: unknown; turma: unknown; resumo: string | null; resumo_liberado_em: string | null; versao: number | null };
  paee_resumo: { periodo: string | null } | null;
  evolucao: { evolucao: { disciplina: string; periodos: number; media_mais_recente: number | null }[] };
  ciencia_pei: { acknowledged: boolean; acknowledged_at: string | null };
};

export async function resumoParaFamilia(p: { studentId: string; workspaceId: string; familyId: string }): Promise<ResumoParaFamilia | null> {
  const sb = getSupabase();
  const { data: student, error } = await sb
    .from("students")
    .select("id, name, grade, class_group, pei_data, paee_ciclos, planejamento_ativo")
    .eq("id", p.studentId)
    .eq("workspace_id", p.workspaceId)
    .maybeSingle();
  if (error) {
    logger.error({ err: error.message }, "[familia-resumo] student query error:");
    throw new Error("Erro ao buscar estudante");
  }
  if (!student) return null;

  const peiData = (student.pei_data || {}) as Record<string, unknown>;
  const paeeCiclos = (student.paee_ciclos || []) as Array<{ ciclo_id?: string; config_ciclo?: { data_inicio?: string; data_fim?: string; foco_principal?: string } }>;
  const planejamentoAtivo = student.planejamento_ativo;
  const paeeAtivo = planejamentoAtivo ? paeeCiclos.find((c) => c.ciclo_id === planejamentoAtivo) : null;

  // Avaliação processual (tabela pode não existir)
  let registros: Array<{ disciplina: string; bimestre: number; habilidades?: Array<{ nivel_atual?: number }> }> = [];
  try {
    const { data: processualData } = await sb
      .from("avaliacao_processual")
      .select("disciplina, bimestre, habilidades")
      .eq("student_id", p.studentId)
      .eq("workspace_id", p.workspaceId)
      .order("bimestre", { ascending: true });
    registros = (processualData || []) as typeof registros;
  } catch (err) {
    logger.warn({ err }, "[familia-resumo] avaliacao_processual query failed (table may not exist):");
  }
  const disciplinas = [...new Set(registros.map((r) => r.disciplina))];

  // Ciência do PEI: vale a ciência da versão vigente
  let ack: { id: string; acknowledged_at: string | null } | null = null;
  try {
    const { data: ackData } = await sb
      .from("family_pei_acknowledgments")
      .select("id, acknowledged_at, pei_snapshot_id")
      .eq("family_responsible_id", p.familyId)
      .eq("student_id", p.studentId)
      .order("acknowledged_at", { ascending: false });
    const snap = snapshotDaVersao(peiData);
    const rows = (ackData || []) as Array<{ id: string; acknowledged_at: string | null; pei_snapshot_id: string | null }>;
    ack = rows.find((r) => r.pei_snapshot_id === snap) || (snap === "sem-versao" ? rows[0] || null : null);
  } catch (err) {
    logger.warn({ err }, "[familia-resumo] family_pei_acknowledgments query failed (table may not exist):");
  }

  const evolucaoPorDisciplina = disciplinas.map((disc) => {
    const regs = registros.filter((r) => r.disciplina === disc).sort((a, b) => a.bimestre - b.bimestre);
    const medias = regs
      .map((r) => {
        const h = r.habilidades || [];
        return h.length > 0 ? h.reduce((acc, x) => acc + (x.nivel_atual || 0), 0) / h.length : null;
      })
      .filter((m): m is number => m !== null);
    const mediaRecente = medias.length > 0 ? Math.round(medias[medias.length - 1] * 10) / 10 : null;
    return { disciplina: disc, periodos: regs.length, media_mais_recente: mediaRecente };
  });

  return {
    estudante: { id: student.id, name: student.name, grade: student.grade, class_group: student.class_group },
    pei_resumo: {
      nome: peiData.nome,
      serie: peiData.serie,
      turma: peiData.turma,
      // Onda 5: a família vê só o resumo escrito para ela e liberado pela coordenação
      resumo: ((peiData.resumo_familia as { texto?: string } | undefined)?.texto) || null,
      resumo_liberado_em: ((peiData.resumo_familia as { liberado_em?: string } | undefined)?.liberado_em) || null,
      versao: (peiData.vigencia as { versao?: number; status?: string } | undefined)?.versao || null,
    },
    paee_resumo: paeeAtivo
      ? { periodo: paeeAtivo.config_ciclo ? `${paeeAtivo.config_ciclo.data_inicio || ""} a ${paeeAtivo.config_ciclo.data_fim || ""}` : null }
      : null,
    evolucao: { evolucao: evolucaoPorDisciplina },
    ciencia_pei: ack ? { acknowledged: true, acknowledged_at: ack.acknowledged_at } : { acknowledged: false, acknowledged_at: null },
  };
}

/** Registra a ciência do PEI (versão vigente) por um responsável. Devolve se já havia. */
export async function registrarCienciaPei(p: { studentId: string; workspaceId: string; familyId: string; ip: string | null; userAgent: string | null }): Promise<{ ja: boolean }> {
  const sb = getSupabase();
  const { data: est } = await sb.from("students").select("pei_data").eq("id", p.studentId).eq("workspace_id", p.workspaceId).maybeSingle();
  const snapshot = snapshotDaVersao((est?.pei_data || {}) as Record<string, unknown>);
  const { data: existing } = await sb
    .from("family_pei_acknowledgments")
    .select("id")
    .eq("family_responsible_id", p.familyId)
    .eq("student_id", p.studentId)
    .eq("pei_snapshot_id", snapshot)
    .limit(1)
    .maybeSingle();
  if (existing) return { ja: true };
  const { error } = await sb.from("family_pei_acknowledgments").insert({
    family_responsible_id: p.familyId,
    student_id: p.studentId,
    pei_snapshot_id: snapshot,
    ip_address: p.ip,
    user_agent: p.userAgent,
  });
  if (error) {
    logger.error({ err: error }, "[ciencia-pei] Erro ao inserir:");
    throw new Error("Erro ao registrar ciência");
  }
  return { ja: false };
}
