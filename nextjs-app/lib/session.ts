import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { getSecret } from "./jwt-secret";

const COOKIE_NAME = "omnisfera_session";

export type SessionPayload = {
  workspace_id: string | null;
  workspace_name: string;
  usuario_nome: string;
  /** SCRUM-70: id de quem entrou (membro, responsável, escola da conta principal ou admin), para a auditoria */
  usuario_id?: string | null;
  user_role: "master" | "member" | "platform_admin" | "family";
  member?: Record<string, unknown>;
  family_responsible_id?: string;
  is_platform_admin?: boolean;
  terms_accepted?: boolean;
  // Admin simulation mode (admin → school)
  simulating_workspace_id?: string;
  simulating_workspace_name?: string;
  // Master simulation mode (master → member)
  simulating_member_id?: string;
  simulating_member_name?: string;
  original_master_session?: string; // JSON backup
  // Demonstração (onda 44): sessão de visitante na Escola Demo, sem senha e sem gravar nada
  is_demo?: boolean;
  demo_papel?: string;
  demo_lead_id?: string | null;
  exp: number;
};

export async function createSession(payload: Omit<SessionPayload, "exp">, duracaoSegundos = 60 * 60 * 24 * 7): Promise<void> {
  const token = await new SignJWT({
    ...payload,
    exp: Math.floor(Date.now() / 1000) + duracaoSegundos,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .sign(getSecret());

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: duracaoSegundos,
    path: "/",
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as SessionPayload;
  } catch { /* expected fallback */
    return null;
  }
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Onda 0: id do membro (professor/coordenação) logado, tirado da própria sessão.
 * Antes, algumas telas procuravam o membro pelo nome, o que confunde homônimos
 * e, sem achar, tratava o professor como coordenação (via todos os estudantes).
 */
export function memberIdDaSessao(session: Partial<SessionPayload> | null | undefined): string | undefined {
  if (!session) return undefined;
  if (session.simulating_member_id) return session.simulating_member_id;
  const id = (session.member as { id?: unknown } | undefined)?.id;
  return typeof id === "string" && id ? id : undefined;
}

// 10/10/2026: o registro de uso da IA (lib/tracking) descobre a escola da requisição por aqui
(globalThis as { __omniWorkspaceDaSessao?: () => Promise<string | undefined> }).__omniWorkspaceDaSessao = async () => {
  const s = await getSession();
  return (s?.simulating_workspace_id || s?.workspace_id || undefined) as string | undefined;
};
