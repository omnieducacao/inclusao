/**
 * Frente 6 · o convite visto do lado de quem recebe. O link traz um token; no banco só existe o hash.
 * Para ver ou aceitar, a pessoa já está logada no app (cria a conta antes, se precisar).
 */
import { getSupabase } from "@/lib/supabase";
import { hashToken } from "@/lib/app/sessao";

export type ConviteAberto = {
  id: string;
  crianca_id: string;
  tipo: string;
  nome: string;
  acesso_ate: string | null;
  convidado_por: string | null;
};

const TOKEN = /^[A-Za-z0-9_-]{20,64}$/;

/** O convite que vale para este token: pendente e dentro do prazo. Senão, null (sem dizer por quê). */
export async function conviteDoToken(token: unknown): Promise<ConviteAberto | null> {
  if (typeof token !== "string" || !TOKEN.test(token)) return null;
  const { data } = await getSupabase()
    .from("rede_membros")
    .select("id, crianca_id, tipo, nome, status, acesso_ate, convite_expira_em, convidado_por")
    .eq("convite_token_hash", hashToken(token))
    .maybeSingle();
  const m = data as (ConviteAberto & { status: string; convite_expira_em: string | null }) | null;
  if (!m || m.status !== "convidado") return null;
  if (!m.convite_expira_em || Date.parse(m.convite_expira_em) < Date.now()) return null;
  return { id: m.id, crianca_id: m.crianca_id, tipo: m.tipo, nome: m.nome, acesso_ate: m.acesso_ate, convidado_por: m.convidado_por };
}

export const CONVITE_INVALIDO = "Este convite não vale mais. Peça à família um link novo.";
