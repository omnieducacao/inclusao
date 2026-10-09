import { NextResponse } from "next/server";
import { getSession, memberIdDaSessao } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";
import { listStudentsDaSessao } from "@/lib/students";
import type { Vigencia } from "@/lib/estudo-caso";

/**
 * GET /api/pei/meus-peis (onda 2)
 * PEIs vigentes dos estudantes do vínculo de quem está logado, com o que o professor precisa
 * para a sala de aula e se ele já deu ciência da versão atual.
 */
export async function GET() {
  const session = await getSession();
  if (!session?.workspace_id || session.user_role === "family") {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  const memberId = memberIdDaSessao(session);
  const estudantes = await listStudentsDaSessao(session);

  const comPei = estudantes
    .map((s) => ({ s, pei: (s.pei_data || {}) as Record<string, unknown> }))
    .filter(({ pei }) => {
      const v = pei.vigencia as Vigencia | undefined;
      return v && (v.status === "vigente" || v.status === "em_revisao") && v.versao > 0;
    });

  let cientes = new Set<string>();
  if (memberId && comPei.length > 0) {
    const { data } = await getSupabase()
      .from("pei_ciencias")
      .select("student_id, versao")
      .eq("workspace_id", session.workspace_id)
      .eq("member_id", memberId)
      .in("student_id", comPei.map(({ s }) => s.id));
    cientes = new Set((data || []).map((c: { student_id: string; versao: number }) => `${c.student_id}:${c.versao}`));
  }

  const lista = comPei.map(({ s, pei }) => {
    const v = pei.vigencia as Vigencia;
    return {
      id: s.id,
      nome: s.name,
      serie: s.grade,
      turma: s.class_group,
      vigencia: v,
      ciente: cientes.has(`${s.id}:${v.versao}`),
      hiperfoco: pei.hiperfoco || null,
      potencias: pei.potencias || [],
      estrategias_acesso: pei.estrategias_acesso || [],
      estrategias_ensino: pei.estrategias_ensino || [],
      estrategias_avaliacao: pei.estrategias_avaliacao || [],
      texto_pei: String(pei.ia_sugestao || ""),
    };
  });

  return NextResponse.json({ podeDarCiencia: Boolean(memberId), estudantes: lista });
}
