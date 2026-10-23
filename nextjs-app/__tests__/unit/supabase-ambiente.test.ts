/**
 * SCRUM-66: o servidor só usa a chave de serviço (sem fallback para a anon) e, em produção,
 * o app não sobe sem as variáveis obrigatórias. Os valores abaixo são inventados.
 */
import { describe, it, expect, afterEach } from "vitest";
import { getSupabase } from "@/lib/supabase";
import { exigirAmbiente, variaveisFaltando } from "@/lib/ambiente";

const NOMES = ["SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_KEY", "SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"] as const;
const guardadas: Record<string, string | undefined> = {};
for (const n of NOMES) guardadas[n] = process.env[n];

afterEach(() => {
  for (const n of NOMES) {
    if (guardadas[n] === undefined) delete process.env[n];
    else process.env[n] = guardadas[n];
  }
});

function limpar() {
  for (const n of NOMES) delete process.env[n];
}

describe("getSupabase", () => {
  it("com URL e chave de serviço, devolve o cliente", () => {
    limpar();
    process.env.SUPABASE_URL = "https://exemplo.supabase.co";
    process.env.SUPABASE_SERVICE_KEY = "chave-de-servico-de-teste";
    expect(typeof getSupabase().from).toBe("function");
  });

  it("só com a chave pública (anon), recusa em vez de cair nela", () => {
    limpar();
    process.env.SUPABASE_URL = "https://exemplo.supabase.co";
    process.env.SUPABASE_ANON_KEY = "chave-publica-de-teste";
    expect(() => getSupabase()).toThrow(/SUPABASE_SERVICE_KEY/);
  });

  it("o nome antigo SUPABASE_SERVICE_ROLE_KEY não vale (um único nome)", () => {
    limpar();
    process.env.SUPABASE_URL = "https://exemplo.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "chave-de-teste";
    expect(() => getSupabase()).toThrow(/SUPABASE_SERVICE_KEY/);
  });

  it("sem URL, recusa", () => {
    limpar();
    process.env.SUPABASE_SERVICE_KEY = "chave-de-servico-de-teste";
    expect(() => getSupabase()).toThrow(/SUPABASE_URL/);
  });

  it("aceita NEXT_PUBLIC_SUPABASE_URL no lugar de SUPABASE_URL", () => {
    limpar();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://exemplo.supabase.co";
    process.env.SUPABASE_SERVICE_KEY = "chave-de-servico-de-teste";
    expect(() => getSupabase()).not.toThrow();
  });
});

describe("exigirAmbiente (subida do app em produção)", () => {
  const completo = { NODE_ENV: "production", SUPABASE_URL: "https://x.supabase.co", SUPABASE_SERVICE_KEY: "k", SESSION_SECRET: "s" };

  it("produção completa passa", () => {
    expect(() => exigirAmbiente(completo)).not.toThrow();
    expect(variaveisFaltando(completo)).toEqual([]);
  });

  it("produção sem a chave de serviço falha, dizendo o nome e nunca o valor", () => {
    const env = { ...completo, SUPABASE_SERVICE_KEY: undefined, SUPABASE_ANON_KEY: "valor-secreto-anon" };
    expect(() => exigirAmbiente(env)).toThrow(/SUPABASE_SERVICE_KEY/);
    try {
      exigirAmbiente(env);
    } catch (e) {
      expect((e as Error).message).not.toContain("valor-secreto-anon");
    }
  });

  it("lista todas as que faltam", () => {
    expect(variaveisFaltando({ NODE_ENV: "production" })).toHaveLength(3);
    expect(() => exigirAmbiente({ NODE_ENV: "production" })).toThrow(/SESSION_SECRET/);
  });

  it("fora de produção (dev, teste) não exige nada", () => {
    expect(() => exigirAmbiente({ NODE_ENV: "development" })).not.toThrow();
    expect(() => exigirAmbiente({ NODE_ENV: "test" })).not.toThrow();
  });
});
