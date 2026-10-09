/**
 * Onda 0: o perfil família só passa pela área /familia e pelas APIs feitas para ela.
 */
import { describe, it, expect, vi } from "vitest";
import { SignJWT } from "jose";
import { NextRequest } from "next/server";

vi.mock("@/lib/upstash-rate-limit", () => ({
  checkRateLimit: vi.fn(async () => ({ success: true, limit: 100, remaining: 99, reset: 0 })),
}));

import { proxy } from "@/proxy";
import { getSecret } from "@/lib/jwt-secret";

async function token(user_role: string) {
  return new SignJWT({ user_role, workspace_id: "ws-1" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1h")
    .sign(getSecret());
}

async function chamar(path: string, role: string) {
  const req = new NextRequest(new URL(path, "http://localhost:3000"), {
    headers: { cookie: `omnisfera_session=${await token(role)}` },
  });
  return proxy(req);
}

describe("proxy · perfil família", () => {
  it("deixa a família usar /familia e as APIs dela", async () => {
    for (const p of ["/familia", "/familia/estudante/abc", "/api/familia/meus-estudantes", "/api/auth/logout", "/api/announcements/unviewed"]) {
      const r = await chamar(p, "family");
      expect(r.status, p).toBe(200);
    }
  });

  it("nega APIs da escola para a família (403)", async () => {
    for (const p of ["/api/students", "/api/students/abc/pei-data", "/api/pei/exportar", "/api/members"]) {
      const r = await chamar(p, "family");
      expect(r.status, p).toBe(403);
    }
  });

  it("manda a família de volta para /familia nas telas da escola", async () => {
    const r = await chamar("/pei", "family");
    expect(r.status).toBe(307);
    expect(r.headers.get("location")).toContain("/familia");
  });

  it("não muda nada para professores", async () => {
    const r = await chamar("/api/students", "member");
    expect(r.status).toBe(200);
  });
});
