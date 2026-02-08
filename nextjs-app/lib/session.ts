import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE_NAME = "omnisfera_session";
const SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET || "omnisfera-dev-secret-change-in-prod"
);

export type SessionPayload = {
  workspace_id: string | null;
  workspace_name: string;
  usuario_nome: string;
  user_role: "master" | "member" | "platform_admin";
  member?: Record<string, unknown>;
  is_platform_admin?: boolean;
  terms_accepted?: boolean;
  exp: number;
};

export async function createSession(payload: Omit<SessionPayload, "exp">): Promise<void> {
  const token = await new SignJWT({
    ...payload,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .sign(SECRET);

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
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
