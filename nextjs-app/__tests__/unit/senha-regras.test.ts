import { createHash } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import { checarSenhaNova, MSG_SENHA_CURTA, MSG_SENHA_VAZADA, vezesEmVazamentos } from "../../lib/senha-regras";

function respostaHibp(senha: string, vezes: number) {
  const hash = createHash("sha1").update(senha).digest("hex").toUpperCase();
  const corpo = `0000000000000000000000000000000000A:3\r\n${hash.slice(5)}:${vezes}\r\nFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF:0`;
  return vi.fn(async (url: string) => {
    expect(url).toBe(`https://api.pwnedpasswords.com/range/${hash.slice(0, 5)}`);
    return new Response(corpo, { status: 200 });
  }) as unknown as typeof fetch;
}

describe("vezesEmVazamentos", () => {
  it("envia só os 5 primeiros caracteres do resumo e acha a senha vazada", async () => {
    expect(await vezesEmVazamentos("senhafraca1", respostaHibp("senhafraca1", 4200))).toBe(4200);
  });
  it("devolve 0 quando a senha não está na lista", async () => {
    const buscar = vi.fn(async () => new Response("0000000000000000000000000000000000A:3", { status: 200 })) as unknown as typeof fetch;
    expect(await vezesEmVazamentos("uma-senha-bem-longa-e-unica", buscar)).toBe(0);
  });
  it("devolve null quando o serviço falha (não trava a escola)", async () => {
    const fora = vi.fn(async () => { throw new Error("sem rede"); }) as unknown as typeof fetch;
    expect(await vezesEmVazamentos("qualquer-coisa", fora)).toBeNull();
    const erro = vi.fn(async () => new Response("", { status: 503 })) as unknown as typeof fetch;
    expect(await vezesEmVazamentos("qualquer-coisa", erro)).toBeNull();
  });
});

describe("checarSenhaNova", () => {
  it("recusa senha curta sem consultar a internet", async () => {
    const buscar = vi.fn() as unknown as typeof fetch;
    expect(await checarSenhaNova("1234567", buscar)).toBe(MSG_SENHA_CURTA);
    expect(await checarSenhaNova(undefined, buscar)).toBe(MSG_SENHA_CURTA);
    expect(buscar).not.toHaveBeenCalled();
  });
  it("recusa senha vazada", async () => {
    expect(await checarSenhaNova("password123", respostaHibp("password123", 250000))).toBe(MSG_SENHA_VAZADA);
  });
  it("aceita senha boa, e aceita quando não deu para conferir", async () => {
    const vazio = vi.fn(async () => new Response("", { status: 200 })) as unknown as typeof fetch;
    expect(await checarSenhaNova("cavalo-azul-bateria-grampo", vazio)).toBeNull();
    const fora = vi.fn(async () => { throw new Error("sem rede"); }) as unknown as typeof fetch;
    expect(await checarSenhaNova("cavalo-azul-bateria-grampo", fora)).toBeNull();
  });
});
