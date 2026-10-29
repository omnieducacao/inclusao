import { NextResponse } from "next/server";
import { pessoaDoPedido } from "@/lib/app/sessao";
import { ehUuid } from "@/lib/app/acesso";
import { ligarAlunoDaEscola } from "@/lib/app/escola";
import { logAction } from "@/lib/audit";

/**
 * Frente 6 · onda 103 · combo (SCRUM-311): a família responde "este aluno da escola é a mesma
 * criança que eu já acompanho?". POST { student_id, crianca_id } liga a escola àquela criança
 * (que mantém o plano da família); { student_id, crianca_id: null } cria uma criança nova.
 */
export async function POST(req: Request) {
  const pessoaId = await pessoaDoPedido(req);
  if (!pessoaId) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  if (!ehUuid(b.student_id)) return NextResponse.json({ error: "Estudante não informado." }, { status: 400 });
  if (b.crianca_id !== null && !ehUuid(b.crianca_id)) return NextResponse.json({ error: "Escolha a criança ou diga que é outra." }, { status: 400 });
  const r = await ligarAlunoDaEscola(pessoaId, b.student_id, (b.crianca_id as string | null) ?? null);
  if ("erro" in r) return NextResponse.json({ error: r.erro }, { status: r.status });
  await logAction({ actorId: pessoaId, actorRole: "responsavel", action: "update", resourceType: "crianca_escola", resourceId: r.crianca_id, metadata: { ligou: b.crianca_id ? "mesma_crianca" : "crianca_nova" }, req });
  return NextResponse.json({ ok: true, crianca_id: r.crianca_id });
}
