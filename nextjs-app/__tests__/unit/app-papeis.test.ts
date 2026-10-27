import { describe, it, expect, vi, beforeAll } from "vitest";
import { criarFakeDb, criarFakeSupabase, type FakeDb } from "../helpers/fake-supabase";

/**
 * Frente 6 · /eu: o nome da criança é cifrado no banco. Nas consultas com tabela embutida
 * (familias → criancas, rede_membros → criancas) a decifragem automática não alcança o nível de dentro;
 * papeisDaPessoa abre esses nomes. Sem isso, o app mostraria "enc:…" no lugar do nome.
 */
let db: FakeDb;
vi.mock("@/lib/supabase", () => ({ getSupabase: () => criarFakeSupabase(db) }));

beforeAll(() => {
  process.env.ENCRYPTION_KEY = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
});

describe("papéis da pessoa", () => {
  it("abre o nome das crianças que vêm embutidas", async () => {
    const { encryptField } = await import("@/lib/encryption");
    const PEDRO = { id: "c1", nome: encryptField("Pedro Alves"), nascimento: null, modo: "crianca" };
    const LIA = { id: "c2", nome: encryptField("Lia Souza"), nascimento: null, modo: "crianca" };
    expect(PEDRO.nome.startsWith("enc:")).toBe(true);
    db = criarFakeDb({
      pessoas: [{ id: "p1", nome: "Patrícia", ativo: true }],
      familia_responsaveis: [{ pessoa_id: "p1", parentesco: "mãe", familias: { id: "f1", nome: "Família Alves", plano: "teste", criancas: [PEDRO] } }],
      criancas: [],
      rede_membros: [{ id: "m1", pessoa_id: "p1", tipo: "profissional", status: "ativo", acesso_ate: null, criancas: LIA }],
      workspace_members: [],
    });
    const { papeisDaPessoa } = await import("@/lib/app/papeis");
    const p = await papeisDaPessoa("p1");
    expect(p?.familias[0].criancas[0].nome).toBe("Pedro Alves");
    expect(p?.rede[0].crianca.nome).toBe("Lia Souza");
  });
});
