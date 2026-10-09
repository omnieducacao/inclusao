import { describe, it, expect } from "vitest";
import { proximoStatus, lerSugestoes, normalizarMissao } from "@/lib/missoes";

describe("missões: quem muda o quê", () => {
  it("a família só marca como feita uma missão aprovada", () => {
    expect(proximoStatus("aprovada", "feita", "familia")).toBe("feita");
    expect(proximoStatus("feita", "feita", "familia")).toBeNull();
    expect(proximoStatus("aprovada", "confirmar", "familia")).toBeNull();
  });
  it("a escola confirma, reabre e arquiva", () => {
    expect(proximoStatus("feita", "confirmar", "escola")).toBe("confirmada");
    expect(proximoStatus("confirmada", "reabrir", "escola")).toBe("aprovada");
    expect(proximoStatus("aprovada", "arquivar", "escola")).toBe("arquivada");
    expect(proximoStatus("arquivada", "confirmar", "escola")).toBeNull();
  });
});

describe("missões: resposta da IA", () => {
  it("lê o JSON mesmo com texto em volta e limpa os campos", () => {
    const r = lerSugestoes('Aqui estão:\n[{"titulo":"  Missão K-POP  ","passos":["Leia a letra","Conte as palavras",""],"meta":"leitura","onde":"lua","porque":"engaja"}]\nPronto');
    expect(r).toHaveLength(1);
    expect(r[0]).toMatchObject({ titulo: "Missão K-POP", passos: ["Leia a letra", "Conte as palavras"], onde: "casa", porque: "engaja" });
  });
  it("devolve vazio quando não há JSON válido", () => {
    expect(lerSugestoes("sem json")).toEqual([]);
    expect(lerSugestoes("[{oops}]")).toEqual([]);
  });
  it("recusa missão sem título", () => {
    expect(normalizarMissao({ passos: ["x"] })).toBeNull();
  });
});
