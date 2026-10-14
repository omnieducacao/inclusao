import { describe, expect, it } from "vitest";
import { ehRobo, telefoneValido, validarLead } from "@/lib/leads";

const base = { nome: "Ana Fictícia", email: "Ana@Escola.org", telefone: "(81) 99999-1234", escola: "Escola Teste", cargo: "Coordenação", consentimento: true };

describe("validarLead", () => {
  it("aceita o mínimo e normaliza e-mail e espaços", () => {
    const r = validarLead({ ...base, nome: "  Ana   Fictícia " });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.lead.email).toBe("ana@escola.org");
      expect(r.lead.nome).toBe("Ana Fictícia");
      expect(r.lead.origem).toBe("contato");
      expect(r.lead.papel_demo).toBeNull();
    }
  });

  it("exige consentimento, cargo da lista e e-mail válido", () => {
    const r = validarLead({ ...base, consentimento: "true", cargo: "Diretor geral", email: "ana@" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(Object.keys(r.erros).sort()).toEqual(["cargo", "consentimento", "email"]);
  });

  it("exige telefone com DDD", () => {
    const sem = validarLead({ ...base, telefone: "" });
    expect(sem.ok).toBe(false);
    if (!sem.ok) expect(sem.erros.telefone).toMatch(/WhatsApp/);
    expect(validarLead({ ...base, escola: "" }).ok).toBe(false);
    expect(validarLead({ ...base, telefone: "(81) 99999-1234" }).ok).toBe(true);
    expect(validarLead({ ...base, telefone: "1234" }).ok).toBe(false);
  });

  it("descarta opções fora da lista em vez de gravar texto livre", () => {
    const r = validarLead({ ...base, uf: "XX", tipo_instituicao: "Escola particular", faixa_estudantes: "<script>" });
    expect(r.ok && r.lead.uf).toBeNull();
    expect(r.ok && r.lead.tipo_instituicao).toBe("Escola particular");
    expect(r.ok && r.lead.faixa_estudantes).toBeNull();
  });

  it("guarda o papel só quando vem da demonstração", () => {
    const r = validarLead({ ...base, origem: "demonstracao", papel_demo: "AEE" });
    expect(r.ok && r.lead.papel_demo).toBe("AEE");
    const c = validarLead({ ...base, papel_demo: "AEE" });
    expect(c.ok && c.lead.papel_demo).toBeNull();
  });

  it("corta textos longos", () => {
    const r = validarLead({ ...base, mensagem: "a".repeat(5000) });
    expect(r.ok && r.lead.mensagem?.length).toBe(2000);
  });
});

describe("telefoneValido e ehRobo", () => {
  it("aceita com e sem +55", () => {
    expect(telefoneValido("+55 81 3333-4444")).toBe(true);
    expect(telefoneValido("81933334444")).toBe(true);
    expect(telefoneValido("333-4444")).toBe(false);
  });
  it("marca como robô quem preenche o campo escondido", () => {
    expect(ehRobo({ site: "http://spam" })).toBe(true);
    expect(ehRobo({ site: "" })).toBe(false);
    expect(ehRobo(null)).toBe(false);
  });
});
