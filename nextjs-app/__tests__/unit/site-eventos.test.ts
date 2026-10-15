import { describe, expect, it } from "vitest";
import { classificarOrigem, dispositivoDe, ehRoboUA, normalizarPagina, validarEvento, visitanteDoDia } from "@/lib/site-eventos";
import { resumirSite, type LinhaEvento } from "@/lib/site-metricas";
import { resumirAcessos, type LinhaAcesso } from "@/lib/acessos-resumo";

describe("site-eventos", () => {
  it("normaliza a página", () => {
    expect(normalizarPagina("/formacao/?x=1#cert")).toBe("/formacao/");
    expect(normalizarPagina("/site/index.html")).toBe("/");
    expect(normalizarPagina("conheca")).toBe("/conheca");
  });
  it("valida e descarta", () => {
    expect(validarEvento({ t: "visita", p: "/" })?.tipo).toBe("visita");
    expect(validarEvento({ t: "clique", p: "/" })).toBeNull();
    expect(validarEvento({ t: "x", p: "/" })).toBeNull();
    const e = validarEvento({ t: "visita", p: "/conheca", r: "https://l.instagram.com/?u=x", u: { s: "Insta" } });
    expect(e?.ref_host).toBe("l.instagram.com");
    expect(e?.utm_source).toBe("insta");
    expect(validarEvento({ t: "visita", p: "/", r: "https://www.omnisfera.net/formacao/" })?.ref_host).toBeNull();
  });
  it("classifica a origem", () => {
    expect(classificarOrigem("l.instagram.com", null)).toBe("Instagram");
    expect(classificarOrigem(null, "whatsapp")).toBe("WhatsApp");
    expect(classificarOrigem("google.com.br", null)).toBe("Google");
    expect(classificarOrigem(null, null)).toBe("Direto ou WhatsApp");
    expect(classificarOrigem("exemplo.com", null)).toBe("Outros sites");
  });
  it("robôs, dispositivo e visitante do dia", () => {
    expect(ehRoboUA("Mozilla/5.0 HeadlessChrome/120")).toBe(true);
    expect(ehRoboUA("WhatsApp/2.23")).toBe(true);
    expect(ehRoboUA("Mozilla/5.0 (iPhone) Safari")).toBe(false);
    expect(dispositivoDe("Mozilla/5.0 (Linux; Android 14) Mobile")).toBe("celular");
    expect(visitanteDoDia("1.2.3.4", "ua", "2026-10-16")).not.toBe(visitanteDoDia("1.2.3.4", "ua", "2026-10-17"));
  });
});

describe("resumos do painel", () => {
  const ev = (tipo: LinhaEvento["tipo"], pagina: string, alvo: string | null, visitante: string): LinhaEvento =>
    ({ criado_em: "2026-10-16T15:00:00Z", tipo, pagina, alvo, origem: tipo === "visita" ? "Instagram" : null, visitante, dispositivo: "celular" });
  it("monta o funil por pessoa", () => {
    const r = resumirSite([
      ev("visita", "/", null, "a"), ev("visita", "/conheca", null, "a"), ev("marco", "/conheca", "conheca:fim", "a"),
      ev("clique", "/conheca", "demonstracao", "a"), ev("visita", "/", null, "b"), ev("visita", "/formacao/", null, "b"),
      ev("marco", "/autismo/", "formacao:tema:autismo", "b"),
    ], { demonstracoes: 1, contatos: 0, certificados: 0 }, 7, new Date("2026-10-16T20:00:00Z"));
    expect(r.totais.pessoas).toBe(2);
    expect(r.funil.map((f) => f.pessoas)).toEqual([2, 1, 1, 1, 1, 0]);
    expect(r.formacao.map((f) => f.pessoas)).toEqual([1, 1, 0, 0]);
    expect(r.porDia).toHaveLength(7);
    expect(r.porDia[6]).toMatchObject({ dia: "2026-10-16", pessoas: 2 });
  });
  it("agrupa a demonstração por contato e mede o tempo", () => {
    const a = (tipo: LinhaAcesso["tipo"], min: number, extra: Partial<LinhaAcesso> = {}): LinhaAcesso =>
      ({ criado_em: new Date(Date.UTC(2026, 9, 16, 15, min)).toISOString(), tipo, workspace_id: null, workspace_nome: null, usuario_nome: null, papel: null, lead_id: "L1", rota: null, modulo: null, ...extra });
    const r = resumirAcessos([
      a("demo_entrada", 0, { papel: "Professor(a) do AEE" }), a("demo_pagina", 1, { modulo: "PEI" }), a("demo_pagina", 7, { modulo: "PAEE" }),
      a("login", 3, { lead_id: null, workspace_id: "W", workspace_nome: "Escola X", usuario_nome: "Ana", papel: "aee" }),
    ], [{ id: "L1", nome: "Maria", escola: "Colégio Y", email: "m@y.com" }]);
    expect(r.demos[0]).toMatchObject({ nome: "Maria", minutos: 7, telas: ["PEI", "PAEE"], papeis: ["Professor(a) do AEE"], paginas: 2 });
    expect(r.totais).toMatchObject({ logins: 1, pessoas: 1, escolas: 1, demonstracoes: 1 });
  });
});
