/**
 * SCRUM-231 etapa 3: índice cego do e-mail. E-mails fictícios.
 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { criarFakeDb, criarFakeSupabase } from "../helpers/fake-supabase";

const A = "aa".repeat(32);
const B = "bb".repeat(32);
const guardada = { atual: process.env.ENCRYPTION_KEY, anterior: process.env.ENCRYPTION_KEY_ANTERIOR };
beforeEach(() => {
  process.env.ENCRYPTION_KEY = A;
  delete process.env.ENCRYPTION_KEY_ANTERIOR;
});
afterEach(() => {
  if (guardada.atual === undefined) delete process.env.ENCRYPTION_KEY; else process.env.ENCRYPTION_KEY = guardada.atual;
  if (guardada.anterior === undefined) delete process.env.ENCRYPTION_KEY_ANTERIOR; else process.env.ENCRYPTION_KEY_ANTERIOR = guardada.anterior;
});

describe("indiceDoEmail", () => {
  it("é o mesmo para o mesmo e-mail, ignorando maiúsculas e espaços, e não contém o e-mail", async () => {
    const { indiceDoEmail } = await import("@/lib/indice-cego");
    const a = indiceDoEmail("Ana.Souza@Escola.test ");
    expect(a).toBe(indiceDoEmail("ana.souza@escola.test"));
    expect(a).not.toContain("ana");
    expect(a).toMatch(/^e:[0-9a-f]{64}$/);
    expect(indiceDoEmail("outra@escola.test")).not.toBe(a);
    expect(indiceDoEmail("")).toBeNull();
  });

  it("muda com a chave (sem a chave não se reproduz) e, na rotação, a busca aceita as duas", async () => {
    const { indiceDoEmail, indicesDoEmail, indiceComChave } = await import("@/lib/indice-cego");
    const comA = indiceDoEmail("ana@escola.test");
    expect(indiceComChave("ana@escola.test", B)).not.toBe(comA);
    process.env.ENCRYPTION_KEY = B;
    process.env.ENCRYPTION_KEY_ANTERIOR = A;
    expect(indicesDoEmail("ana@escola.test")).toEqual([indiceComChave("ana@escola.test", B), comA]);
  });
});

describe("camada de colunas: índice ao gravar e busca pelo índice", () => {
  it("insert e update gravam o email_hash; update sem e-mail não mexe nele", async () => {
    const { comColunasCifradas } = await import("@/lib/colunas-cifradas");
    const { indiceDoEmail } = await import("@/lib/indice-cego");
    const db = criarFakeDb({ workspace_members: [] });
    const sb = comColunasCifradas(criarFakeSupabase(db) as never) as ReturnType<typeof criarFakeSupabase>;
    await sb.from("workspace_members").insert({ id: "m1", workspace_id: "ws", email: "Ana@Escola.test" });
    expect(db.tabelas.workspace_members[0].email_hash).toBe(indiceDoEmail("ana@escola.test"));
    await sb.from("workspace_members").update({ nome: "Ana" }).eq("id", "m1");
    expect(db.tabelas.workspace_members[0].email_hash).toBe(indiceDoEmail("ana@escola.test"));
    await sb.from("workspace_members").update({ email: "nova@escola.test" }).eq("id", "m1");
    expect(db.tabelas.workspace_members[0].email_hash).toBe(indiceDoEmail("nova@escola.test"));
  });

  it("com a leitura pelo índice ligada, .eq(\"email\") acha a pessoa mesmo com o e-mail gravado cifrado", async () => {
    const { comColunasCifradas } = await import("@/lib/colunas-cifradas");
    const { indiceDoEmail } = await import("@/lib/indice-cego");
    const { encryptField } = await import("@/lib/encryption");
    const db = criarFakeDb({
      workspace_members: [{ id: "m1", workspace_id: "ws", email: encryptField("ana@escola.test"), email_hash: indiceDoEmail("ana@escola.test") }],
    });
    const sb = comColunasCifradas(criarFakeSupabase(db) as never, { lerPorIndice: true }) as ReturnType<typeof criarFakeSupabase>;
    const { data } = await sb.from("workspace_members").select("*").eq("workspace_id", "ws").eq("email", "ANA@escola.test ").maybeSingle();
    expect((data as Record<string, unknown>)?.id).toBe("m1");
    const nada = await sb.from("workspace_members").select("*").eq("email", "outra@escola.test").maybeSingle();
    expect(nada.data).toBeNull();
  });

  it("com a leitura pelo índice desligada (deploy A), .eq(\"email\") continua pelo e-mail", async () => {
    const { comColunasCifradas } = await import("@/lib/colunas-cifradas");
    const db = criarFakeDb({ workspace_members: [{ id: "m1", email: "ana@escola.test", email_hash: null }] });
    const sb = comColunasCifradas(criarFakeSupabase(db) as never, { lerPorIndice: false }) as ReturnType<typeof criarFakeSupabase>;
    const { data } = await sb.from("workspace_members").select("*").eq("email", "ana@escola.test").maybeSingle();
    expect((data as Record<string, unknown>)?.id).toBe("m1");
  });
});
