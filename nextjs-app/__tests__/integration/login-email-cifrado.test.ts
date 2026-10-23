/**
 * SCRUM-231 etapa 3B: login com o e-mail gravado cifrado e a busca pelo índice cego, passando
 * pelo lib/auth.ts real e pela camada de colunas real, sobre o banco falso. Dados fictícios.
 */
import { describe, it, expect, vi, beforeAll } from "vitest";
import { criarFakeDb, criarFakeSupabase, type FakeDb } from "../helpers/fake-supabase";

let db: FakeDb;
vi.mock("@/lib/logger", () => ({ logger: { warn: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn() } }));
vi.mock("@/lib/supabase", async () => {
  const { comColunasCifradas } = await import("@/lib/colunas-cifradas");
  return { getSupabase: () => comColunasCifradas(criarFakeSupabase(db) as never) };
});

beforeAll(async () => {
  process.env.ENCRYPTION_KEY = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
  const bcrypt = (await import("bcryptjs")).default;
  const hash = bcrypt.hashSync("senha-certa", 4);
  const { encryptField } = await import("@/lib/encryption");
  const { indiceDoEmail } = await import("@/lib/indice-cego");
  const cif = (e: string) => ({ email: encryptField(e), email_hash: indiceDoEmail(e) });
  db = criarFakeDb({
    workspaces: [{ id: "ws-A", name: "Escola A (fictícia)", family_module_enabled: true }],
    workspace_masters: [{ workspace_id: "ws-A", nome: "Coord", password_hash: hash, ...cif("coord@escola.test") }],
    workspace_members: [{ id: "m1", workspace_id: "ws-A", nome: "Prof", password_hash: hash, active: true, ...cif("prof@escola.test") }],
    family_responsibles: [{ id: "f1", workspace_id: "ws-A", nome: "Resp", password_hash: hash, active: true, ...cif("mae@familia.test") }],
    platform_admins: [{ id: "a1", nome: "Admin", password_hash: hash, active: true, ...cif("admin@omni.test") }],
  });
});

describe("login com e-mail cifrado", () => {
  it("acha coordenação, professor e família pelo índice, e o e-mail volta aberto", async () => {
    const { findUserByEmail } = await import("@/lib/auth");
    expect((await findUserByEmail("Coord@Escola.test"))?.role).toBe("master");
    const prof = await findUserByEmail("prof@escola.test");
    expect(prof?.role).toBe("member");
    expect((prof?.user as Record<string, unknown>).email).toBe("prof@escola.test");
    expect((await findUserByEmail("mae@familia.test"))?.role).toBe("family");
    expect(await findUserByEmail("ninguem@escola.test")).toBeNull();
  });

  it("confere a senha de cada tipo de conta", async () => {
    const { verifyWorkspaceMaster, verifyMemberPassword, verifyFamilyPassword, verifyPlatformAdmin } = await import("@/lib/auth");
    expect(await verifyWorkspaceMaster("ws-A", "coord@escola.test", "senha-certa")).toBe(true);
    expect(await verifyMemberPassword("ws-A", "prof@escola.test", "senha-certa")).toBe(true);
    expect(await verifyFamilyPassword("ws-A", "mae@familia.test", "senha-certa")).toBe(true);
    expect(await verifyPlatformAdmin("admin@omni.test", "senha-certa")).toBe(true);
    expect(await verifyMemberPassword("ws-A", "prof@escola.test", "senha-errada")).toBe(false);
  });

  it("nada no banco guarda o e-mail aberto", () => {
    const tudo = JSON.stringify(db.tabelas);
    for (const e of ["coord@escola.test", "prof@escola.test", "mae@familia.test", "admin@omni.test"]) expect(tudo).not.toContain(e);
  });
});
