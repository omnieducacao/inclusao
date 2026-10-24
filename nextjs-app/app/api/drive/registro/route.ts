import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { auditar } from "@/lib/audit";
import { normalizarDominio, podeSalvarNoDrive } from "@/lib/drive-politica";
import { lerPoliticaDrive } from "@/lib/drive-politica-servidor";

/**
 * Onda 92 · SCRUM-243: antes de enviar a cópia ao Drive, o navegador pergunta aqui.
 * O servidor aplica a regra da escola e grava na auditoria quem salvou, qual documento e o DOMÍNIO da conta
 * (nunca o e-mail inteiro). Body: { recurso: "pei" | "paee" | "relatorio"; recursoId?: string; dominioConta: string }
 */
const RECURSOS = new Set(["pei", "paee", "relatorio"]);

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.workspace_id || session.user_role === "family") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  let body: { recurso?: unknown; recursoId?: unknown; dominioConta?: unknown };
  try {
    body = await req.json();
  } catch { /* expected fallback */
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }
  const recurso = String(body.recurso ?? "");
  if (!RECURSOS.has(recurso)) return NextResponse.json({ error: "Documento inválido" }, { status: 400 });
  const dominioConta = normalizarDominio(body.dominioConta);
  if (!dominioConta) return NextResponse.json({ error: "Conta do Google inválida" }, { status: 400 });
  const recursoId = typeof body.recursoId === "string" && body.recursoId.length <= 64 ? body.recursoId : null;

  const { politica, dominio } = await lerPoliticaDrive(session.workspace_id);
  const decisao = podeSalvarNoDrive(politica, dominio, dominioConta);
  if (!decisao.ok) return NextResponse.json({ ok: false, motivo: decisao.motivo }, { status: 403 });

  await auditar(session, req, {
    action: "export",
    resourceType: recurso,
    resourceId: recursoId,
    metadata: { format: "google_drive", dominio_conta: dominioConta, regra: politica },
  });
  return NextResponse.json({ ok: true });
}
