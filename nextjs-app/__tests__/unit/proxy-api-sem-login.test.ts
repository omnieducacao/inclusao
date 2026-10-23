/**
 * SCRUM-227: rotas /api sem login. Sem sessão (ou com sessão inválida) a API responde 401 em JSON;
 * as telas continuam indo para o login. Nenhuma rota de API escapa do proxy pelo matcher.
 */
import { describe, it, expect, vi } from "vitest";
import { SignJWT } from "jose";
import { NextRequest } from "next/server";

vi.mock("@/lib/upstash-rate-limit", () => ({
  checkRateLimit: vi.fn(async () => ({ success: true, limit: 100, remaining: 99, reset: 0 })),
}));

import { proxy, config } from "@/proxy";
import { getSecret } from "@/lib/jwt-secret";

function req(path: string, cookie?: string, method = "GET") {
  return new NextRequest(new URL(path, "http://localhost:3000"), { method, headers: cookie ? { cookie } : {} });
}

describe("proxy · API sem login", () => {
  it("responde 401 em JSON, sem redirecionar", async () => {
    for (const [p, m] of [["/api/students", "GET"], ["/api/students/abc/pei-data", "PATCH"], ["/api/members", "POST"], ["/api/auth/logout", "POST"]]) {
      const r = await proxy(req(p, undefined, m));
      expect(r.status, p).toBe(401);
      expect(r.headers.get("location"), p).toBeNull();
      expect(await r.json(), p).toEqual({ error: "Não autenticado." });
    }
  });

  it("sessão inválida: 401 e apaga o cookie", async () => {
    const r = await proxy(req("/api/students", "omnisfera_session=eyJhbGciOiJIUzI1NiJ9.eyJ4IjoxfQ.falso"));
    expect(r.status).toBe(401);
    expect(r.headers.get("set-cookie") || "").toMatch(/omnisfera_session=;/);
  });

  it("sessão assinada com outra chave também é recusada", async () => {
    const outra = await new SignJWT({ user_role: "member", workspace_id: "ws-1" })
      .setProtectedHeader({ alg: "HS256" }).setExpirationTime("1h")
      .sign(new TextEncoder().encode("outra-chave-qualquer-com-mais-de-32-caracteres"));
    expect((await proxy(req("/api/students", `omnisfera_session=${outra}`))).status).toBe(401);
  });

  it("sessão vencida é recusada", async () => {
    const vencida = await new SignJWT({ user_role: "member", workspace_id: "ws-1" })
      .setProtectedHeader({ alg: "HS256" }).setExpirationTime(Math.floor(Date.now() / 1000) - 60)
      .sign(getSecret());
    expect((await proxy(req("/api/students", `omnisfera_session=${vencida}`))).status).toBe(401);
  });

  it("as telas continuam indo para o login", async () => {
    const r = await proxy(req("/pei"));
    expect(r.status).toBe(307);
    expect(r.headers.get("location")).toContain("/login?redirect=%2Fpei");
  });

  it("rotas públicas seguem abertas", async () => {
    for (const p of ["/api/health", "/api/auth/login", "/api/public/contato", "/api/vitals"]) {
      expect((await proxy(req(p, undefined, "POST"))).status, p).toBe(200);
    }
  });
});

describe("proxy · matcher", () => {
  const casa = (path: string) =>
    config.matcher.some((m) => {
      if (m === "/api/:path*") return path.startsWith("/api/");
      return new RegExp(`^${m}$`).test(path);
    });

  it("toda rota de API passa pelo proxy, mesmo terminando em .png ou .svg", () => {
    for (const p of ["/api/students/abc.png", "/api/members/x.svg", "/api/students", "/api/familia/estudante/1.jpg"]) {
      expect(casa(p), p).toBe(true);
    }
  });

  it("arquivos estáticos fora da API continuam fora do proxy", () => {
    for (const p of ["/_next/static/a.js", "/logo.png", "/favicon.ico"]) expect(casa(p), p).toBe(false);
  });
});
