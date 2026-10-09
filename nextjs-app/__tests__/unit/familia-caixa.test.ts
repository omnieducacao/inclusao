import { describe, it, expect } from "vitest";
import { snapshotDaVersao, validarTextoMensagem, negadoCaixaFamilia, LIMITE_MENSAGEM } from "@/lib/familia-caixa";

describe("família: ciência por versão", () => {
  it("usa a versão vigente do PEI", () => {
    expect(snapshotDaVersao({ vigencia: { versao: 3, status: "vigente" } })).toBe("v3");
  });
  it("antes de valer, marca sem versão", () => {
    expect(snapshotDaVersao({})).toBe("sem-versao");
    expect(snapshotDaVersao({ vigencia: { versao: 0 } })).toBe("sem-versao");
  });
});

describe("família: mensagens", () => {
  it("aceita texto com espaços nas pontas e recusa vazio ou longo demais", () => {
    expect(validarTextoMensagem("  oi, tudo bem?  ")).toBe("oi, tudo bem?");
    expect(validarTextoMensagem("   ")).toBeNull();
    expect(validarTextoMensagem(123)).toBeNull();
    expect(validarTextoMensagem("a".repeat(LIMITE_MENSAGEM + 1))).toBeNull();
  });
});

describe("família: quem vê o que a família envia", () => {
  it("direção e coordenação veem; professor sem PEI nem cadastro não vê; família nunca", () => {
    expect(negadoCaixaFamilia({ workspace_id: "w", user_role: "master" })).toBeNull();
    expect(negadoCaixaFamilia({ workspace_id: "w", user_role: "member", member: { can_pei: true } })).toBeNull();
    expect(negadoCaixaFamilia({ workspace_id: "w", user_role: "member", member: { can_pei_professor: true } })?.status).toBe(403);
    expect(negadoCaixaFamilia({ workspace_id: "w", user_role: "family" })?.status).toBe(403);
  });
});
