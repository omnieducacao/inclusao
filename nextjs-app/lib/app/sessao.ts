/**
 * Frente 6 · login do app da família (Omnisfera no celular).
 *
 * O site usa um cookie; o app não. Aqui o app recebe dois tokens:
 *   acesso     JWT de 15 min, enviado em "Authorization: Bearer …" em cada chamada a /api/app/v1
 *   renovacao  sequência aleatória de 30 dias, guardada no cofre do celular; no banco fica só o SHA-256
 * A cada renovação o token antigo é revogado e sai um novo (rotação). Se um token já revogado voltar,
 * alguém copiou o token: todas as sessões daquela pessoa são encerradas.
 *
 * O segredo do app é derivado do SESSION_SECRET (HMAC com um rótulo próprio), então um token do app
 * nunca vale como cookie do site, e vice-versa.
 */
import { SignJWT, jwtVerify } from "jose";
import { createHash, createHmac, randomBytes } from "node:crypto";
import { getSupabase } from "@/lib/supabase";

export const APP_AUDIENCIA = "omnisfera-app";
export const ACESSO_SEGUNDOS = 15 * 60;
export const RENOVACAO_DIAS = 30;

let segredo: Uint8Array | null = null;
function segredoApp(): Uint8Array {
  if (!segredo) {
    const base = process.env.SESSION_SECRET || (process.env.NODE_ENV === "production" ? "" : "omnisfera-dev-secret-change-in-prod");
    if (!base) throw new Error("SESSION_SECRET não está definida: o login do app não funciona sem ela.");
    segredo = new Uint8Array(createHmac("sha256", base).update("omnisfera-app-v1").digest());
  }
  return segredo;
}

/** Só para testes: o segredo é lido de novo do ambiente. */
export function _esquecerSegredo(): void {
  segredo = null;
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function emitirAcesso(pessoaId: string): Promise<string> {
  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(pessoaId)
    .setAudience(APP_AUDIENCIA)
    .setIssuedAt()
    .setExpirationTime(`${ACESSO_SEGUNDOS}s`)
    .sign(segredoApp());
}

export async function verificarAcesso(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, segredoApp(), { audience: APP_AUDIENCIA, algorithms: ["HS256"] });
    return typeof payload.sub === "string" && payload.sub ? payload.sub : null;
  } catch {
    return null;
  }
}

/** Id da pessoa logada no app, lido do cabeçalho Authorization. Sem token válido: null. */
export async function pessoaDoPedido(req: Request): Promise<string | null> {
  const m = /^Bearer\s+(\S+)$/i.exec(req.headers.get("authorization") || "");
  return m ? verificarAcesso(m[1]) : null;
}

export type ParDeTokens = {
  acesso: string;
  renovacao: string;
  acesso_expira_em: string;
  renovacao_expira_em: string;
};

export async function abrirSessao(pessoaId: string, dispositivo?: string | null): Promise<ParDeTokens> {
  const renovacao = randomBytes(32).toString("base64url");
  const renovacaoExpira = new Date(Date.now() + RENOVACAO_DIAS * 864e5).toISOString();
  const { error } = await getSupabase().from("app_sessoes").insert({
    pessoa_id: pessoaId,
    token_hash: hashToken(renovacao),
    dispositivo: dispositivo ? String(dispositivo).slice(0, 80) : null,
    expira_em: renovacaoExpira,
  });
  if (error) throw new Error("Não deu para abrir a sessão do app.");
  return {
    acesso: await emitirAcesso(pessoaId),
    renovacao,
    acesso_expira_em: new Date(Date.now() + ACESSO_SEGUNDOS * 1000).toISOString(),
    renovacao_expira_em: renovacaoExpira,
  };
}

type LinhaSessao = { id: string; pessoa_id: string; dispositivo: string | null; expira_em: string; revogada_em: string | null };

/** Troca o token de renovação por um par novo. Token vencido, revogado ou desconhecido: null. */
export async function renovarSessao(renovacao: string): Promise<ParDeTokens | null> {
  if (!renovacao) return null;
  const sb = getSupabase();
  const { data } = await sb
    .from("app_sessoes")
    .select("id, pessoa_id, dispositivo, expira_em, revogada_em")
    .eq("token_hash", hashToken(renovacao))
    .maybeSingle();
  const s = data as LinhaSessao | null;
  if (!s) return null;
  const agora = new Date().toISOString();
  if (s.revogada_em) {
    // Reuso de um token já trocado: encerra todas as sessões da pessoa.
    await sb.from("app_sessoes").update({ revogada_em: agora }).eq("pessoa_id", s.pessoa_id).is("revogada_em", null);
    return null;
  }
  if (Date.parse(s.expira_em) <= Date.now()) return null;
  await sb.from("app_sessoes").update({ revogada_em: agora, ultimo_uso_em: agora }).eq("id", s.id);
  return abrirSessao(s.pessoa_id, s.dispositivo);
}

export async function encerrarSessao(renovacao: string): Promise<void> {
  if (!renovacao) return;
  await getSupabase()
    .from("app_sessoes")
    .update({ revogada_em: new Date().toISOString() })
    .eq("token_hash", hashToken(renovacao))
    .is("revogada_em", null);
}
