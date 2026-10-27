/**
 * Frente 6: /api/app/ é pública no proxy (o app do celular não tem o cookie do site).
 * Então cada rota precisa conferir o token do app sozinha. Só o login, a renovação e a saída
 * (que recebem o token de renovação no corpo) ficam sem pessoaDoPedido.
 */
import { describe, it, expect, vi } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { NextRequest } from "next/server";

vi.mock("@/lib/upstash-rate-limit", () => ({
  checkRateLimit: vi.fn(async () => ({ success: true, limit: 100, remaining: 99, reset: 0 })),
}));

import { proxy } from "@/proxy";

const RAIZ = join(__dirname, "..", "..", "app", "api", "app");

function rotas(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) return rotas(p);
    return n === "route.ts" ? [p] : [];
  });
}

describe("app · rotas guardadas pelo token do app", () => {
  it("toda rota fora de auth/ chama pessoaDoPedido", () => {
    const todas = rotas(RAIZ);
    expect(todas.length).toBeGreaterThan(0);
    const semGuarda = todas
      .map((p) => relative(RAIZ, p))
      .filter((r) => !r.startsWith(join("v1", "auth")))
      .filter((r) => !/pessoaDoPedido\(/.test(readFileSync(join(RAIZ, r), "utf8")));
    expect(semGuarda).toEqual([]);
  });

  it("o proxy deixa /api/app/ chegar à rota sem cookie, e só /api/app/", async () => {
    const r = await proxy(new NextRequest(new URL("/api/app/v1/eu", "http://localhost:3000")));
    expect(r.status).toBe(200);
    // prefixo parecido não vira público
    const outra = await proxy(new NextRequest(new URL("/api/appx/qualquer", "http://localhost:3000")));
    expect(outra.status).toBe(401);
  });
});
