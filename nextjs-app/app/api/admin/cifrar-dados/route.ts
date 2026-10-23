/**
 * POST /api/admin/cifrar-dados (SCRUM-231) — só admin da plataforma.
 *
 * Regrava, dentro do servidor (onde a ENCRYPTION_KEY já está), os dados antigos que ficaram em
 * texto claro antes de a cifra valer para eles:
 *   - students: diagnosis, campos sensíveis do pei_data (inclusive nas cópias do histórico) e paee_data;
 *   - telefone de workspace_members, workspace_masters e family_responsibles;
 *   - IP em audit_log e IP e navegador em family_pei_acknowledgments, trocados pelo resumo.
 *
 * Body: { aplicar?: boolean }. Sem `aplicar: true` só conta (simulação). Seguro repetir: o que já
 * está cifrado ou resumido é pulado. A resposta traz só contagens, nunca valores.
 */
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabaseSemCifra } from "@/lib/supabase";
import { encryptField, encryptSensitivePeiFields, encryptSensitivePaeeFields } from "@/lib/encryption";
import { resumirIp, resumirNavegador } from "@/lib/resumo-acesso";
import { logAction } from "@/lib/audit";
import { logger } from "@/lib/logger";

const PAGINA = 200;
type Linha = Record<string, unknown>;
type Contagem = { linhas: number; a_mudar: number; gravadas: number; erros: number };

const cifradoOuVazio = (v: unknown) => typeof v !== "string" || !v.trim() || v.startsWith("enc:");
const igual = (a: unknown, b: unknown) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

async function percorrer(
  sb: ReturnType<typeof getSupabaseSemCifra>,
  tabela: string,
  colunas: string,
  mudar: (l: Linha) => Linha | null,
  aplicar: boolean
): Promise<Contagem> {
  const c: Contagem = { linhas: 0, a_mudar: 0, gravadas: 0, erros: 0 };
  for (let de = 0; ; de += PAGINA) {
    const { data, error } = await sb.from(tabela).select(colunas).order("id").range(de, de + PAGINA - 1);
    if (error) {
      logger.error({ err: error.message, tabela }, "cifrar-dados: erro ao ler");
      c.erros += 1;
      break;
    }
    const linhas = (data || []) as unknown as Linha[];
    for (const l of linhas) {
      c.linhas += 1;
      const novo = mudar(l);
      if (!novo || Object.keys(novo).length === 0) continue;
      c.a_mudar += 1;
      if (!aplicar) continue;
      const { error: e } = await sb.from(tabela).update(novo).eq("id", l.id as string);
      if (e) {
        logger.error({ err: e.message, tabela }, "cifrar-dados: erro ao gravar");
        c.erros += 1;
      } else {
        c.gravadas += 1;
      }
    }
    if (linhas.length < PAGINA) break;
  }
  return c;
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.is_platform_admin) {
    return NextResponse.json({ error: "Apenas o admin da plataforma." }, { status: 403 });
  }
  const body = (await req.json().catch(() => ({}))) as { aplicar?: unknown };
  const aplicar = body.aplicar === true;
  const sb = getSupabaseSemCifra();

  const relatorio: Record<string, Contagem> = {};

  relatorio.estudantes = await percorrer(sb, "students", "id, diagnosis, pei_data, paee_data", (l) => {
    const novo: Linha = {};
    if (!cifradoOuVazio(l.diagnosis)) novo.diagnosis = encryptField(l.diagnosis as string);
    if (l.pei_data && typeof l.pei_data === "object") {
      const pei = encryptSensitivePeiFields(l.pei_data as Linha);
      if (!igual(pei, l.pei_data)) novo.pei_data = pei;
    }
    if (l.paee_data && typeof l.paee_data === "object") {
      const paee = encryptSensitivePaeeFields(l.paee_data as Linha);
      if (!igual(paee, l.paee_data)) novo.paee_data = paee;
    }
    return novo;
  }, aplicar);

  for (const tabela of ["workspace_members", "workspace_masters", "family_responsibles"]) {
    relatorio[`telefone_${tabela}`] = await percorrer(sb, tabela, "id, telefone", (l) =>
      cifradoOuVazio(l.telefone) ? null : { telefone: encryptField(l.telefone as string) }, aplicar);
  }

  relatorio.ip_audit_log = await percorrer(sb, "audit_log", "id, ip_address", (l) =>
    typeof l.ip_address === "string" && l.ip_address && !l.ip_address.startsWith("ip:")
      ? { ip_address: resumirIp(l.ip_address) }
      : null, aplicar);

  relatorio.ciencia_pei = await percorrer(sb, "family_pei_acknowledgments", "id, ip_address, user_agent", (l) => {
    const novo: Linha = {};
    if (typeof l.ip_address === "string" && l.ip_address && !l.ip_address.startsWith("ip:")) novo.ip_address = resumirIp(l.ip_address);
    if (typeof l.user_agent === "string" && l.user_agent && !l.user_agent.includes(" · ")) novo.user_agent = resumirNavegador(l.user_agent);
    return novo;
  }, aplicar);

  const total = Object.values(relatorio).reduce((n, c) => n + c.a_mudar, 0);
  if (aplicar) {
    await logAction({
      workspaceId: null,
      actorName: "admin da plataforma", // sem nome no log (SCRUM-70)
      actorRole: session.user_role,
      action: "update",
      resourceType: "manutencao_cifra",
      metadata: { total, gravadas: Object.values(relatorio).reduce((n, c) => n + c.gravadas, 0) },
    });
  }
  return NextResponse.json({ aplicado: aplicar, total_a_mudar: total, relatorio });
}
