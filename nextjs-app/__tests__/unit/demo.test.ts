import { describe, expect, it } from "vitest";
import { demoPaginaBloqueada, demoPodeChamar, papelDemoValido, PAPEIS_DEMO } from "@/lib/demo";
import { moduloDaRota } from "@/lib/demo-modulos";

describe("demonstração só leitura", () => {
  it("deixa ler tudo", () => {
    expect(demoPodeChamar("/api/students", "GET")).toBe(true);
    expect(demoPodeChamar("/estudantes", "POST")).toBe(true); // páginas não passam por aqui
  });
  it("recusa o que muda dados", () => {
    for (const m of ["POST", "PATCH", "PUT", "DELETE"]) expect(demoPodeChamar("/api/students/1", m)).toBe(false);
    expect(demoPodeChamar("/api/pei/gerar", "POST")).toBe(false);
    expect(demoPodeChamar("/api/simulate-member", "POST")).toBe(false);
  });
  it("libera sair, trocar de papel e as rotas públicas", () => {
    expect(demoPodeChamar("/api/auth/logout", "POST")).toBe(true);
    expect(demoPodeChamar("/api/demo/papel", "POST")).toBe(true);
    expect(demoPodeChamar("/api/public/contato", "POST")).toBe(true);
  });
  it("bloqueia a administração e a área da família", () => {
    expect(demoPaginaBloqueada("/admin")).toBe(true);
    expect(demoPaginaBloqueada("/familia/x")).toBe(true);
    expect(demoPaginaBloqueada("/pei")).toBe(false);
  });
  it("conhece os três papéis", () => {
    expect(Object.keys(PAPEIS_DEMO)).toEqual(["aee", "regente", "coordenacao"]);
    expect(papelDemoValido("regente")).toBe(true);
    expect(papelDemoValido("admin")).toBe(false);
  });
  it("traduz rotas em módulos", () => {
    expect(moduloDaRota("/pei-professor")).toBe("PEI do professor");
    expect(moduloDaRota("/pei")).toBe("PEI");
    expect(moduloDaRota("/avaliacao-diagnostica")).toBe("Avaliação");
    expect(moduloDaRota("/")).toBe("Início");
    expect(moduloDaRota("/qualquer")).toBeNull();
  });
});
