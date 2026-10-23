/**
 * SCRUM-229: limites de tentativas. Cada tipo de limite tem o seu balde, a IA conta por pessoa
 * (com teto por IP) e o log nunca guarda o IP nem o e-mail. Dados fictícios.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const avisos: Array<{ obj: Record<string, unknown>; msg: string }> = [];
vi.mock("@/lib/logger", () => ({
  logger: { warn: (obj: Record<string, unknown>, msg: string) => avisos.push({ obj, msg }), error: vi.fn(), info: vi.fn(), debug: vi.fn() },
}));

let sessao: Record<string, unknown> | null = null;
vi.mock("@/lib/session", () => ({ getSession: vi.fn(async () => sessao) }));

import { rateLimitResponse, rateLimitIA, limitarPorChave, RATE_LIMITS } from "@/lib/rate-limit";

let n = 0;
const ipNovo = () => `198.51.100.${++n}-${Math.random().toString(36).slice(2, 6)}`;
const req = (ip: string) => new Request("http://localhost/api", { method: "POST", headers: { "x-forwarded-for": ip } });

beforeEach(() => {
  avisos.length = 0;
  sessao = null;
});

describe("baldes separados", () => {
  it("gastar a cota de IA não bloqueia o login do mesmo IP (antes dividiam o balde)", async () => {
    const ip = ipNovo();
    sessao = { workspace_id: "ws-A", user_role: "member", usuario_nome: "Prof", member: { id: "m1" } };
    for (let i = 0; i < RATE_LIMITS.AI_GENERATION.maxRequests; i++) expect(await rateLimitIA(req(ip))).toBeNull();
    expect(await rateLimitIA(req(ip))).not.toBeNull(); // a IA dessa pessoa esgotou
    expect(rateLimitResponse(req(ip), RATE_LIMITS.AUTH_IP)).toBeNull(); // o login continua
  });

  it("formulário público: a 6ª mensagem em 10 minutos do mesmo IP é barrada", () => {
    const ip = ipNovo();
    for (let i = 0; i < 5; i++) expect(rateLimitResponse(req(ip), RATE_LIMITS.FORM_PUBLIC)).toBeNull();
    const r = rateLimitResponse(req(ip), RATE_LIMITS.FORM_PUBLIC);
    expect(r?.status).toBe(429);
    expect(r?.headers.get("Retry-After")).toBeTruthy();
  });
});

describe("IA por pessoa", () => {
  it("dois professores da mesma escola, no mesmo IP, têm cotas separadas", async () => {
    const ip = ipNovo();
    sessao = { workspace_id: "ws-A", user_role: "member", usuario_nome: "Ana", member: { id: "m-ana" } };
    for (let i = 0; i < RATE_LIMITS.AI_GENERATION.maxRequests; i++) await rateLimitIA(req(ip));
    expect(await rateLimitIA(req(ip))).not.toBeNull();

    sessao = { workspace_id: "ws-A", user_role: "member", usuario_nome: "Bruno", member: { id: "m-bruno" } };
    expect(await rateLimitIA(req(ip))).toBeNull();
  });

  it("geração de imagem tem limite próprio, menor", async () => {
    const ip = ipNovo();
    sessao = { workspace_id: "ws-A", user_role: "member", usuario_nome: "Ana", member: { id: "m-img" } };
    for (let i = 0; i < RATE_LIMITS.AI_IMAGE.maxRequests; i++) expect(await rateLimitIA(req(ip), RATE_LIMITS.AI_IMAGE)).toBeNull();
    expect(await rateLimitIA(req(ip), RATE_LIMITS.AI_IMAGE)).not.toBeNull();
  });

  it("teto por IP vale para a escola toda", async () => {
    const ip = ipNovo();
    for (let i = 0; i < RATE_LIMITS.AI_IP.maxRequests; i++) {
      sessao = { workspace_id: "ws-A", user_role: "member", usuario_nome: `P${i}`, member: { id: `m-${i}` } };
      expect(await rateLimitIA(req(ip))).toBeNull();
    }
    sessao = { workspace_id: "ws-A", user_role: "member", usuario_nome: "Mais um", member: { id: "m-extra" } };
    expect((await rateLimitIA(req(ip)))?.status).toBe(429);
  });
});

describe("registro no log", () => {
  it("registra o nome do limite e um resumo da chave, nunca o IP nem o e-mail", () => {
    const chave = "203.0.113.77:professora@escola.test";
    for (let i = 0; i < RATE_LIMITS.AUTH.maxRequests; i++) limitarPorChave(chave, RATE_LIMITS.AUTH);
    expect(limitarPorChave(chave, RATE_LIMITS.AUTH)?.status).toBe(429);
    expect(avisos).toHaveLength(1);
    const texto = JSON.stringify(avisos[0]);
    expect(avisos[0].obj.limite).toBe("AUTH");
    expect(texto).not.toContain("203.0.113.77");
    expect(texto).not.toContain("professora@escola.test");
  });
});

describe("rotas públicas aplicam o limite", () => {
  const raiz = process.cwd();
  it.each([
    ["app/api/public/contato/route.ts", "FORM_PUBLIC"],
    ["app/api/public/demonstracao/route.ts", "FORM_PUBLIC"],
    ["app/api/public/certificado/route.ts", "FORM_PUBLIC"],
    ["app/api/vitals/route.ts", "VITALS"],
    ["app/api/auth/login/route.ts", "AUTH_IP"],
    ["app/api/auth/admin-login/route.ts", "AUTH_IP"],
  ])("%s usa RATE_LIMITS.%s", (arquivo, limite) => {
    expect(readFileSync(join(raiz, arquivo), "utf8")).toContain(`RATE_LIMITS.${limite}`);
  });

  it("nenhuma rota de IA ficou com o limite antigo por IP", () => {
    const { execSync } = require("node:child_process") as typeof import("node:child_process");
    const achados = execSync("grep -rln 'rateLimitResponse(req, RATE_LIMITS.AI_' app/api || true", { cwd: raiz }).toString().trim();
    expect(achados).toBe("");
  });
});
