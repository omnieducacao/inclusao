import { describe, it, expect } from "vitest";
import { prazoEncerramento, textoPrazo, DIAS_PARA_EXPORTAR } from "@/lib/encerramento";

const agora = new Date("2026-10-24T15:00:00Z");

describe("prazo depois do fim do contrato (SCRUM-247)", () => {
  it("escola ativa ou sem data não tem prazo", () => {
    expect(prazoEncerramento(true, "2026-10-01T00:00:00Z", agora)).toBeNull();
    expect(prazoEncerramento(false, null, agora)).toBeNull();
    expect(prazoEncerramento(undefined, "2026-10-01T00:00:00Z", agora)).toBeNull();
  });

  it("conta 90 dias a partir do encerramento", () => {
    const p = prazoEncerramento(false, "2026-10-24T15:00:00Z", agora)!;
    expect(DIAS_PARA_EXPORTAR).toBe(90);
    expect(p.diasRestantes).toBe(90);
    expect(p.apagaEm.toISOString()).toBe("2027-01-22T15:00:00.000Z");
    expect(textoPrazo(p)).toBe("Os dados serão apagados em 22/01/2027 (faltam 90 dias).");
  });

  it("no fim do prazo avisa que apaga na próxima madrugada", () => {
    const p = prazoEncerramento(false, "2026-07-01T00:00:00Z", agora)!;
    expect(p.diasRestantes).toBe(0);
    expect(textoPrazo(p)).toBe("Os dados serão apagados na próxima madrugada.");
  });

  it("singular com 1 dia", () => {
    const p = prazoEncerramento(false, new Date(agora.getTime() - 89.5 * 864e5), agora)!;
    expect(textoPrazo(p)).toContain("faltam 1 dia)");
  });
});
