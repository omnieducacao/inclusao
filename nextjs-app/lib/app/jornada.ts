/**
 * Frente 6 · onda 103 · a jornada (SCRUM-310): o PEI vira missões e as missões viram conquistas.
 *
 * Na Omnisfera da escola, a coordenação transforma as metas do PEI em missões (lib/missoes) e aprova.
 * Aqui elas entram na jornada da criança no app (app_missoes, origem "pei"), em etapas, ao lado das
 * missões da família, e passam pelas mesmas conquistas automáticas.
 *
 * Quem manda em quê:
 * - o app (criança, adolescente, família) diz quando a missão foi FEITA: ao marcar a última etapa,
 *   a missão da escola fica "feita" lá também, para a escola ver;
 * - a escola CONFIRMA, REABRE ou ARQUIVA: isso volta para o app na próxima sincronização.
 * Regras que não mudam: sem ranking, sem perder pontos, nada ligado a remédio ou a tempo de tela.
 */
import { getSupabase } from "@/lib/supabase";
import { logger } from "@/lib/logger";
import type { Etapa } from "@/lib/app/conquistas";

type MissaoEscola = { id: string; titulo: string; passos: string[] | null; meta: string | null; onde: string | null; status: string; confirmada_em: string | null };
type MissaoApp = { id: string; status: string; etapas: Etapa[] | null; estudante_missao_id: string | null };

const ONDE = new Set(["casa", "escola", "terapia", "casa e escola"]);

/** As etapas de uma missão da escola: os passos que a escola escreveu, ou a própria missão numa etapa só. */
export function etapasDaEscola(m: Pick<MissaoEscola, "titulo" | "passos">): Etapa[] {
  const passos = (m.passos || []).map((p) => String(p).trim()).filter(Boolean).slice(0, 8);
  return (passos.length ? passos : [m.titulo]).map((texto) => ({ texto: texto.slice(0, 120), figura: null, feita_em: null }));
}

/** O status no app a partir do status na escola (a escola é dona de confirmar, reabrir e arquivar). */
export function statusNoApp(escola: string, app: string | null): string | null {
  if (escola === "confirmada") return "confirmada";
  if (escola === "arquivada") return "arquivada";
  if (escola === "feita") return app === "confirmada" ? "feita" : app === "feita" ? null : "feita";
  // aprovada: missão nova, ou reaberta pela escola
  if (app === null) return "ativa";
  if (app === "confirmada" || app === "arquivada") return "ativa";
  return null; // ativa continua ativa; "feita" no app ainda não chegou na escola → o app reenvia
}

/**
 * Traz as missões da escola para a jornada da criança e devolve quantas foram confirmadas agora
 * (para conferir as conquistas). Idempotente e silenciosa: sem escola ligada, não faz nada.
 */
export async function sincronizarMissoesDaEscola(criancaId: string): Promise<{ confirmadas: number }> {
  const sb = getSupabase();
  try {
    const { data: ce } = await sb.from("crianca_escolas").select("workspace_id, student_id").eq("crianca_id", criancaId).eq("status", "ativo").limit(1);
    const v = ((ce as { workspace_id: string; student_id: string }[] | null) || [])[0];
    if (!v) return { confirmadas: 0 };
    const { data: me, error } = await sb
      .from("estudante_missoes")
      .select("id, titulo, passos, meta, onde, status, confirmada_em")
      .eq("student_id", v.student_id)
      .eq("workspace_id", v.workspace_id)
      .in("status", ["aprovada", "feita", "confirmada", "arquivada"]);
    if (error) return { confirmadas: 0 }; // escola sem a tabela de missões
    const daEscola = (me as MissaoEscola[] | null) || [];
    if (!daEscola.length) return { confirmadas: 0 };
    const { data: ma } = await sb.from("app_missoes").select("id, status, etapas, estudante_missao_id").eq("crianca_id", criancaId).eq("origem", "pei");
    const noApp = new Map(((ma as MissaoApp[] | null) || []).filter((m) => m.estudante_missao_id).map((m) => [m.estudante_missao_id!, m]));
    const agora = new Date().toISOString();
    let confirmadas = 0;

    for (const m of daEscola) {
      const atual = noApp.get(m.id) ?? null;
      if (!atual) {
        if (m.status === "arquivada") continue;
        const etapas = etapasDaEscola(m);
        const status = statusNoApp(m.status, null)!;
        if (status !== "ativa") etapas.forEach((e) => { e.feita_em = agora; });
        await sb.from("app_missoes").insert({
          crianca_id: criancaId,
          titulo: m.titulo.slice(0, 100),
          etapas,
          origem: "pei",
          meta_ref: m.meta ? m.meta.slice(0, 80) : null,
          onde: m.onde && ONDE.has(m.onde) ? m.onde : "casa",
          status,
          confirmada_em: status === "confirmada" ? m.confirmada_em || agora : null,
          estudante_missao_id: m.id,
        });
        if (status === "confirmada") confirmadas += 1;
        continue;
      }
      const novo = statusNoApp(m.status, atual.status);
      if (novo === null) {
        // feita no app, ainda "aprovada" na escola: reenviar o "consegui"
        if (m.status === "aprovada" && atual.status === "feita") await avisarEscolaQueFez(m.id, agora);
        continue;
      }
      if (novo === atual.status) continue;
      const mudanca: Record<string, unknown> = { status: novo, updated_at: agora };
      if (novo === "confirmada") { mudanca.confirmada_em = m.confirmada_em || agora; confirmadas += 1; }
      if (novo === "ativa") mudanca.etapas = (atual.etapas || etapasDaEscola(m)).map((e) => ({ ...e, feita_em: null }));
      await sb.from("app_missoes").update(mudanca).eq("id", atual.id);
    }
    return { confirmadas };
  } catch (err) {
    logger.warn({ err }, "[app/jornada] não deu para trazer as missões da escola");
    return { confirmadas: 0 };
  }
}

/** A criança terminou uma missão que veio da escola: ela fica "feita" lá, para a escola confirmar. */
export async function avisarEscolaQueFez(estudanteMissaoId: string, quando = new Date().toISOString(), nota?: string | null): Promise<void> {
  const mudanca: Record<string, unknown> = { status: "feita", feita_em: quando, updated_at: quando };
  if (nota) mudanca.nota_familia = nota.slice(0, 300);
  await getSupabase().from("estudante_missoes").update(mudanca).eq("id", estudanteMissaoId).eq("status", "aprovada");
}
