/**
 * SCRUM-231: colunas cifradas de forma transparente. O banco falso mostra o que fica gravado de
 * verdade (cifrado) e o que o código recebe (aberto). Dados fictícios.
 */
import { describe, it, expect, beforeAll } from "vitest";
import { criarFakeDb, criarFakeSupabase } from "../helpers/fake-supabase";

beforeAll(() => {
  process.env.ENCRYPTION_KEY = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
});

async function montar() {
  const { comColunasCifradas } = await import("@/lib/colunas-cifradas");
  const db = criarFakeDb({
    workspace_members: [{ id: "m-antigo", workspace_id: "ws-A", nome: "Prof Antigo", telefone: "(11) 90000-0000" }],
    students: [],
  });
  return { db, sb: comColunasCifradas(criarFakeSupabase(db) as unknown as { from: (t: string) => unknown }) as unknown as ReturnType<typeof criarFakeSupabase> };
}

describe("colunas cifradas", () => {
  it("insert grava o telefone cifrado e a leitura devolve aberto", async () => {
    const { db, sb } = await montar();
    const { data } = await sb.from("workspace_members").insert({ id: "m1", workspace_id: "ws-A", nome: "Ana", telefone: "(21) 98765-4321" }).select().single();
    const gravado = db.tabelas.workspace_members.find((l) => l.id === "m1")!;
    expect(String(gravado.telefone).startsWith("enc:")).toBe(true);
    expect(gravado.nome).toBe("Ana"); // coluna fora da lista fica como está
    expect((data as Record<string, unknown>).telefone).toBe("(21) 98765-4321");

    const lido = await sb.from("workspace_members").select("*").eq("id", "m1").maybeSingle();
    expect((lido.data as Record<string, unknown>).telefone).toBe("(21) 98765-4321");
  });

  it("update cifra e lista (array) decifra cada linha", async () => {
    const { db, sb } = await montar();
    await sb.from("workspace_members").update({ telefone: "(31) 99999-1111" }).eq("id", "m-antigo");
    expect(String(db.tabelas.workspace_members[0].telefone).startsWith("enc:")).toBe(true);
    const { data } = await sb.from("workspace_members").select("*");
    expect((data as Array<Record<string, unknown>>)[0].telefone).toBe("(31) 99999-1111");
  });

  it("valor antigo em texto claro continua sendo lido", async () => {
    const { sb } = await montar();
    const { data } = await sb.from("workspace_members").select("*").eq("id", "m-antigo").maybeSingle();
    expect((data as Record<string, unknown>).telefone).toBe("(11) 90000-0000");
  });

  it("insert de várias linhas cifra todas; vazio e nulo ficam como estão", async () => {
    const { db, sb } = await montar();
    await sb.from("workspace_members").insert([
      { id: "a", telefone: "(41) 91111-1111" },
      { id: "b", telefone: "" },
      { id: "c", telefone: null },
    ]);
    const t = (id: string) => db.tabelas.workspace_members.find((l) => l.id === id)!.telefone;
    expect(String(t("a")).startsWith("enc:")).toBe(true);
    expect(t("b")).toBe("");
    expect(t("c")).toBeNull();
  });

  it("tabela fora da lista não é tocada", async () => {
    const { db, sb } = await montar();
    await sb.from("students").insert({ id: "s1", telefone: "(51) 92222-2222" });
    expect(db.tabelas.students[0].telefone).toBe("(51) 92222-2222");
  });
});

describe("com o cliente real do supabase-js (rede simulada)", () => {
  it("o corpo enviado ao banco leva o telefone cifrado e a resposta volta aberta", async () => {
    const { createClient } = await import("@supabase/supabase-js");
    const { comColunasCifradas } = await import("@/lib/colunas-cifradas");
    const { encryptField } = await import("@/lib/encryption");
    const enviados: Array<{ url: string; metodo: string; corpo: string }> = [];
    const cifradoNoBanco = encryptField("(61) 93333-3333");

    const fetchFalso = async (url: RequestInfo | URL, init?: RequestInit) => {
      enviados.push({ url: String(url), metodo: init?.method || "GET", corpo: String(init?.body ?? "") });
      const linha = { id: "m9", nome: "Bia", telefone: cifradoNoBanco };
      const corpo = init?.method === "GET" || !init?.method ? JSON.stringify([linha]) : JSON.stringify([linha]);
      return new Response(corpo, { status: 200, headers: { "Content-Type": "application/json", "content-range": "0-0/1" } });
    };
    const sb = comColunasCifradas(createClient("https://exemplo.supabase.co", "chave-de-teste", { global: { fetch: fetchFalso as typeof fetch } }));

    const ins = await sb.from("workspace_members").insert({ id: "m9", nome: "Bia", telefone: "(61) 93333-3333" }).select();
    const corpoInsert = enviados.find((e) => e.metodo === "POST")!.corpo;
    expect(corpoInsert).not.toContain("93333-3333");
    expect(corpoInsert).toContain("enc:");
    expect((ins.data as Array<Record<string, unknown>>)[0].telefone).toBe("(61) 93333-3333");

    const um = await sb.from("workspace_members").select("id, telefone").eq("id", "m9").maybeSingle();
    expect((um.data as Record<string, unknown>).telefone).toBe("(61) 93333-3333");
  });
});
