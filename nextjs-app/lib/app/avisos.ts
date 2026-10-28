/**
 * Frente 6 · avisos no celular (notificações push) pelo serviço da Expo.
 *
 * O app registra o token do aparelho em /api/app/v1/dispositivos. O texto do aviso passa pelos
 * servidores da Expo, da Apple e do Google: por isso nunca leva nome da criança, saúde ou lugar.
 * O detalhe fica no app, atrás do login. Falha ao avisar nunca derruba a rota que chamou.
 */
import { getSupabase } from "@/lib/supabase";
import { logger } from "@/lib/logger";

const EXPO_PUSH = "https://exp.host/--/api/v2/push/send";
export const TOKEN_EXPO = /^Expo(nent)?PushToken\[[A-Za-z0-9_-]{10,}\]$/;

export type Aviso = { titulo: string; corpo: string; dados?: Record<string, unknown> };

export async function enviarPush(tokens: string[], aviso: Aviso): Promise<number> {
  const validos = [...new Set(tokens.filter((t) => TOKEN_EXPO.test(t)))];
  if (!validos.length) return 0;
  const mensagens = validos.map((to) => ({ to, title: aviso.titulo, body: aviso.corpo, data: aviso.dados || {}, sound: "default", priority: "high" }));
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 5000);
    const r = await fetch(EXPO_PUSH, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify(mensagens),
      signal: ctrl.signal,
    });
    clearTimeout(t);
    if (!r.ok) logger.warn(`[avisos] Expo respondeu ${r.status}`);
    return validos.length;
  } catch (e) {
    logger.warn(`[avisos] não deu para enviar: ${String(e).slice(0, 120)}`);
    return 0;
  }
}

/** Avisa os responsáveis da família da criança, em todos os aparelhos ativos deles. */
export async function avisarFamilia(criancaId: string, aviso: Aviso): Promise<number> {
  const sb = getSupabase();
  const { data: c } = await sb.from("criancas").select("familia_id").eq("id", criancaId).maybeSingle();
  const familiaId = (c as { familia_id: string } | null)?.familia_id;
  if (!familiaId) return 0;
  const { data: resp } = await sb.from("familia_responsaveis").select("pessoa_id").eq("familia_id", familiaId);
  const pessoas = ((resp as { pessoa_id: string }[] | null) || []).map((r) => r.pessoa_id);
  if (!pessoas.length) return 0;
  const { data: aparelhos } = await sb.from("app_dispositivos").select("token").in("pessoa_id", pessoas).eq("ativo", true);
  return enviarPush(((aparelhos as { token: string }[] | null) || []).map((a) => a.token), aviso);
}
