import { describe, it, expect, beforeEach, vi } from "vitest";

/** SCRUM-254: um cliente por processo, não um por chamada (cada cliente novo deixava memória presa). */
describe("getSupabase reaproveita o cliente", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("SUPABASE_URL", "https://exemplo.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("SUPABASE_SERVICE_KEY", "chave-de-teste");
  });

  it("devolve o mesmo cliente nas chamadas seguintes", async () => {
    const { getSupabase, getSupabaseSemCifra } = await import("@/lib/supabase");
    expect(getSupabase()).toBe(getSupabase());
    expect(getSupabaseSemCifra()).toBe(getSupabaseSemCifra());
  });

  it("cria outro cliente se a chave mudar", async () => {
    const { getSupabase } = await import("@/lib/supabase");
    const a = getSupabase();
    vi.stubEnv("SUPABASE_SERVICE_KEY", "outra-chave");
    expect(getSupabase()).not.toBe(a);
  });

  it("continua exigindo as variáveis", async () => {
    vi.stubEnv("SUPABASE_SERVICE_KEY", "");
    const { getSupabase } = await import("@/lib/supabase");
    expect(() => getSupabase()).toThrow(/SUPABASE_SERVICE_KEY/);
  });
});
