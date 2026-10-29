import { NextResponse } from "next/server";
import { pessoaDoPedido } from "@/lib/app/sessao";
import { acessoACrianca } from "@/lib/app/acesso";
import { escolaDaCrianca } from "@/lib/app/escola";
import { resumoParaFamilia } from "@/lib/familia-resumo";
import { listarMissoes } from "@/lib/missoes-servidor";
import { mensagensDoEstudante } from "@/lib/familia-caixa";
import { logAction } from "@/lib/audit";

/**
 * Frente 6 · onda 102 · GET: a escola da criança, como o modo família do site mostra.
 * Só para o responsável cadastrado na escola. Sem escola cliente: { escola: null }.
 * Traz: nome da escola e turma, o plano (resumo do PEI escrito para a família e a ciência),
 * a evolução por disciplina, o período do PAEE, as missões da escola e quantas mensagens novas.
 */
type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: Request, ctx: Ctx) {
  const pessoaId = await pessoaDoPedido(req);
  if (!pessoaId) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const { id } = await ctx.params;
  const acesso = await acessoACrianca(pessoaId, id);
  if (!acesso || acesso.papel !== "responsavel") return NextResponse.json({ error: "Sem acesso a esta criança." }, { status: 403 });
  const escola = await escolaDaCrianca(pessoaId, id);
  if (!escola) return NextResponse.json({ escola: null });

  const [resumo, missoes, conversa] = await Promise.all([
    resumoParaFamilia({ studentId: escola.student_id, workspaceId: escola.workspace_id, familyId: escola.family_responsible_id }).catch(() => null),
    listarMissoes(escola.workspace_id, escola.student_id, ["aprovada", "feita", "confirmada"]).catch(() => ({ missoes: [], semMigracao: true })),
    mensagensDoEstudante(escola.workspace_id, escola.student_id).catch(() => ({ mensagens: [], semMigracao: true })),
  ]);
  const novas = conversa.mensagens.filter((m) => m.autor === "escola" && !m.lida_em).length;
  await logAction({ actorId: pessoaId, actorRole: "responsavel", action: "view", resourceType: "escola_app", resourceId: id, req });
  return NextResponse.json({
    escola: {
      nome: escola.nome,
      turma: resumo ? [resumo.estudante.grade, resumo.estudante.class_group].filter(Boolean).join(" · ") || null : null,
      plano: resumo?.pei_resumo ?? null,
      ciencia_pei: resumo?.ciencia_pei ?? { acknowledged: false, acknowledged_at: null },
      evolucao: resumo?.evolucao.evolucao ?? [],
      paee: resumo?.paee_resumo ?? null,
      missoes: missoes.missoes,
      mensagens_novas: novas,
    },
  });
}
