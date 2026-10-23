/**
 * SCRUM-231: rota de manutenção que cifra os dados antigos. Banco falso (mostra o gravado de
 * verdade), sessão de admin da plataforma, dados fictícios.
 */
import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";
import { criarFakeDb, criarFakeSupabase, type FakeDb } from "../helpers/fake-supabase";

let db: FakeDb;
let admin = true;
vi.mock("@/lib/logger", () => ({ logger: { warn: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn() } }));
vi.mock("@/lib/session", () => ({
  getSession: vi.fn(async () => (admin ? { is_platform_admin: true, user_role: "platform_admin", usuario_nome: "Admin", workspace_id: null } : { is_platform_admin: false, user_role: "master", workspace_id: "ws-A" })),
}));
vi.mock("@/lib/supabase", () => ({
  getSupabase: () => criarFakeSupabase(db),
  getSupabaseSemCifra: () => criarFakeSupabase(db),
}));

beforeAll(() => {
  process.env.ENCRYPTION_KEY = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
  process.env.SESSION_SECRET = "segredo-de-teste";
});

const post = (corpo: unknown) => new Request("http://localhost/api/admin/cifrar-dados", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(corpo) });

beforeEach(() => {
  admin = true;
  db = criarFakeDb({
    students: [{
      id: "s1", diagnosis: "TEA", paee_data: { conteudo_diagnostico_barreiras: "barreiras" },
      pei_data: { nome: "Beatriz Almeida", nasc: "2016-03-12", serie: "5º ano", _versions: [{ version: 1, snapshot: { nome: "Beatriz Almeida", diagnostico: "TEA" } }] },
    }],
    workspace_members: [{ id: "m1", telefone: "(11) 91234-5678" }, { id: "m2", telefone: null }],
    workspace_masters: [],
    family_responsibles: [{ id: "r1", telefone: "(21) 98888-7777" }],
    audit_log: [{ id: "a1", ip_address: "203.0.113.5" }, { id: "a2", ip_address: null }],
    family_pei_acknowledgments: [{ id: "c1", ip_address: "198.51.100.9", user_agent: "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/130.0 Mobile Safari/537.36" }],
  });
});

describe("POST /api/admin/cifrar-dados", () => {
  it("só o admin da plataforma", async () => {
    admin = false;
    const { POST } = await import("@/app/api/admin/cifrar-dados/route");
    expect((await POST(post({}))).status).toBe(403);
  });

  it("simulação conta e não muda nada", async () => {
    const { POST } = await import("@/app/api/admin/cifrar-dados/route");
    const antes = JSON.stringify(db.tabelas);
    const r = await (await POST(post({}))).json();
    expect(r.aplicado).toBe(false);
    expect(r.total_a_mudar).toBe(5); // estudante, 2 telefones, 1 IP de auditoria, 1 ciência
    expect(JSON.stringify(db.tabelas)).toBe(antes);
  });

  it("aplicar cifra tudo, troca IP e navegador pelo resumo e repetir não muda mais nada", async () => {
    const { POST } = await import("@/app/api/admin/cifrar-dados/route");
    const r = await (await POST(post({ aplicar: true }))).json();
    expect(r.aplicado).toBe(true);

    const s = db.tabelas.students[0] as Record<string, any>;
    expect(String(s.diagnosis).startsWith("enc:")).toBe(true);
    expect(String(s.pei_data.nome).startsWith("enc:")).toBe(true);
    expect(String(s.pei_data.nasc).startsWith("enc:")).toBe(true);
    expect(s.pei_data.serie).toBe("5º ano");
    expect(String(s.pei_data._versions[0].snapshot.nome).startsWith("enc:")).toBe(true);
    expect(String(s.paee_data.conteudo_diagnostico_barreiras).startsWith("enc:")).toBe(true);
    expect(String(db.tabelas.workspace_members[0].telefone).startsWith("enc:")).toBe(true);
    expect(db.tabelas.workspace_members[1].telefone).toBeNull();
    expect(String(db.tabelas.family_responsibles[0].telefone).startsWith("enc:")).toBe(true);
    expect(String(db.tabelas.audit_log[0].ip_address).startsWith("ip:")).toBe(true);
    expect(db.tabelas.family_pei_acknowledgments[0].user_agent).toBe("Chrome · Android");

    const resposta = JSON.stringify(r);
    expect(resposta).not.toContain("Beatriz");
    expect(resposta).not.toContain("91234-5678");

    const r2 = await (await POST(post({ aplicar: true }))).json();
    expect(r2.total_a_mudar).toBe(0);
  });

  it("o dado cifrado abre de volta igual", async () => {
    const { POST } = await import("@/app/api/admin/cifrar-dados/route");
    await POST(post({ aplicar: true }));
    const { decryptField, decryptSensitivePeiFields } = await import("@/lib/encryption");
    const s = db.tabelas.students[0] as Record<string, any>;
    expect(decryptField(s.diagnosis)).toBe("TEA");
    expect(decryptSensitivePeiFields(s.pei_data).nome).toBe("Beatriz Almeida");
    expect(decryptField(String(db.tabelas.family_responsibles[0].telefone))).toBe("(21) 98888-7777");
  });
});
