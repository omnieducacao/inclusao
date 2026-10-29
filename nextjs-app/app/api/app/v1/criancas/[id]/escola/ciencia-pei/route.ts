import { NextResponse } from "next/server";
import { pessoaDoPedido } from "@/lib/app/sessao";
import { acessoACrianca } from "@/lib/app/acesso";
import { escolaDaCrianca } from "@/lib/app/escola";
import { registrarCienciaPei } from "@/lib/familia-resumo";
import { ipDoPedido, resumirIp, resumirNavegador } from "@/lib/resumo-acesso";
import { logAction } from "@/lib/audit";

/** Frente 6 · onda 102 · POST: a família dá ciência do PEI vigente pelo app (mesma tabela do site). */
type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, ctx: Ctx) {
  const pessoaId = await pessoaDoPedido(req);
  if (!pessoaId) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const { id } = await ctx.params;
  const acesso = await acessoACrianca(pessoaId, id);
  if (!acesso || acesso.papel !== "responsavel") return NextResponse.json({ error: "Sem acesso a esta criança." }, { status: 403 });
  const escola = await escolaDaCrianca(pessoaId, id);
  if (!escola) return NextResponse.json({ error: "Esta criança não está ligada a uma escola." }, { status: 404 });
  try {
    const r = await registrarCienciaPei({
      studentId: escola.student_id,
      workspaceId: escola.workspace_id,
      familyId: escola.family_responsible_id,
      ip: resumirIp(ipDoPedido(req)),
      userAgent: resumirNavegador(req.headers.get("user-agent")),
    });
    await logAction({ actorId: pessoaId, actorRole: "responsavel", action: "create", resourceType: "ciencia_pei", resourceId: escola.student_id, metadata: { canal: "app" }, req });
    return NextResponse.json({ ok: true, acknowledged: true, ja: r.ja });
  } catch {
    return NextResponse.json({ error: "Não deu para registrar agora." }, { status: 500 });
  }
}
