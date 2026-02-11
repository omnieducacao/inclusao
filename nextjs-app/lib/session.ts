import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE_NAME = "omnisfera_session";

let _secret: Uint8Array | null = null;

function getSecret(): Uint8Array {
  if (!_secret) {
    const raw = process.env.SESSION_SECRET;
    if (!raw && process.env.NODE_ENV === "production") {
      throw new Error(
        "🔒 FATAL: SESSION_SECRET não está definida em produção. " +
        "Defina a variável de ambiente SESSION_SECRET antes de iniciar a aplicação. " +
        "Sem ela, os tokens JWT podem ser forjados por qualquer pessoa."
      );
    }
    _secret = new TextEncoder().encode(raw || "omnisfera-dev-secret-change-in-prod");
  }
  return _secret;
}

export type SessionPayload = {
  workspace_id: string | null;
  workspace_name: string;
  usuario_nome: string;
  user_role: "master" | "member" | "platform_admin";
  member?: Record<string, unknown>;
  is_platform_admin?: boolean;
  terms_accepted?: boolean;
  // Simulation mode fields
  simulating_workspace_id?: string;
  simulating_workspace_name?: string;
  exp: number;
};

export async function createSession(payload: Omit<SessionPayload, "exp">): Promise<void> {
  const token = await new SignJWT({
    ...payload,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .sign(getSecret());

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
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
  } catch {
    return null;
  }
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
