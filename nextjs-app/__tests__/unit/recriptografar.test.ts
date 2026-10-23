/**
 * SCRUM-66: script de recriptografia (scripts/recriptografar.mjs). Todo dado é inventado.
 * O formato é conferido contra lib/encryption.ts, o que o app usa de verdade.
 */
import { describe, it, expect, vi, afterEach } from "vitest";
// @ts-expect-error módulo .mjs sem tipos
import { chaveDeHex, recifrarCampo, recifrarLinha, executar, ALVOS } from "../../scripts/recriptografar.mjs";
import { criarFakeDb, criarFakeSupabase } from "../helpers/fake-supabase";

const HEX_A = "aa".repeat(32);
const HEX_B = "bb".repeat(32);
const HEX_C = "cc".repeat(32);
const A = Buffer.from(HEX_A, "hex");
const B = Buffer.from(HEX_B, "hex");
const C = Buffer.from(HEX_C, "hex");
const ORIGINAL = process.env.ENCRYPTION_KEY;

afterEach(() => {
  if (ORIGINAL === undefined) delete process.env.ENCRYPTION_KEY;
  else process.env.ENCRYPTION_KEY = ORIGINAL;
  vi.resetModules();
});

async function appCifra(hex: string, texto: string): Promise<string> {
  process.env.ENCRYPTION_KEY = hex;
  vi.resetModules();
  return (await import("@/lib/encryption")).encryptField(texto);
}
async function appAbre(hex: string, valor: string): Promise<string> {
  process.env.ENCRYPTION_KEY = hex;
  vi.resetModules();
  return (await import("@/lib/encryption")).decryptField(valor);
}

describe("recifrarCampo", () => {
  it("um valor cifrado pelo app com a chave antiga passa a abrir, no app, com a chave nova", async () => {
    const velho = await appCifra(HEX_A, "Transtorno do Espectro Autista, nível 1");
    const r = recifrarCampo(velho, A, B);
    expect(r.estado).toBe("recifrado");
    expect(r.valor).not.toBe(velho);
    expect(await appAbre(HEX_B, r.valor)).toBe("Transtorno do Espectro Autista, nível 1");
    expect(await appAbre(HEX_A, r.valor)).toBe(""); // a chave antiga já não abre
  });

  it("texto plano e vazio ficam como estão", () => {
    expect(recifrarCampo("sem cifra", A, B)).toEqual({ estado: "texto_plano", valor: "sem cifra" });
    expect(recifrarCampo("", A, B).estado).toBe("texto_plano");
    expect(recifrarCampo(42, A, B).estado).toBe("texto_plano");
  });

  it("o que já está na chave nova é pulado (repetir é seguro)", async () => {
    const jaNovo = await appCifra(HEX_B, "dado");
    const r = recifrarCampo(jaNovo, A, B);
    expect(r).toEqual({ estado: "ja_na_nova", valor: jaNovo });
  });

  it("o que nenhuma das duas chaves abre não é tocado", async () => {
    const deOutra = await appCifra(HEX_C, "dado");
    expect(recifrarCampo(deOutra, A, B)).toEqual({ estado: "desconhecida", valor: deOutra });
    expect(recifrarCampo("enc:formato-quebrado", A, B).estado).toBe("desconhecida");
  });

  it("chaveDeHex recusa tamanho errado e não-hex", () => {
    expect(() => chaveDeHex("curta", "X")).toThrow("64 caracteres hex");
    expect(() => chaveDeHex("zz".repeat(32), "X")).toThrow();
    expect(chaveDeHex(HEX_A, "X")).toHaveLength(32);
  });
});

describe("recifrarLinha", () => {
  it("regrava só o que está cifrado, nas colunas e campos do app", async () => {
    const diag = await appCifra(HEX_A, "TEA");
    const medic = await appCifra(HEX_A, "risperidona");
    const linha = {
      id: "est-1",
      diagnosis: diag,
      pei_data: { diagnostico: medic, historico: "texto plano antigo", nome_curto: "Bia", serie: "5º ano" },
      paee_data: null,
    };
    const alvo = ALVOS.find((a: { tabela: string }) => a.tabela === "students");
    const { mudancas, contagem } = recifrarLinha(alvo, linha, A, B);

    expect(Object.keys(mudancas).sort()).toEqual(["diagnosis", "pei_data"]);
    expect(await appAbre(HEX_B, mudancas.diagnosis)).toBe("TEA");
    expect(await appAbre(HEX_B, mudancas.pei_data.diagnostico)).toBe("risperidona");
    // o resto do JSON fica igual
    expect(mudancas.pei_data.historico).toBe("texto plano antigo");
    expect(mudancas.pei_data.nome_curto).toBe("Bia");
    expect(mudancas.pei_data.serie).toBe("5º ano");
    expect(contagem.recifrado).toBe(2);
    expect(contagem.texto_plano).toBe(1);
  });

  it("linha sem nada cifrado não gera mudança", () => {
    const alvo = ALVOS.find((a: { tabela: string }) => a.tabela === "family_mensagens");
    expect(recifrarLinha(alvo, { id: "m1", texto: "oi" }, A, B).mudancas).toEqual({});
  });
});

describe("executar (banco falso)", () => {
  async function montar(qtd: number) {
    const linhas = [];
    for (let i = 0; i < qtd; i++) {
      linhas.push({ id: `m-${String(i).padStart(4, "0")}`, workspace_id: "ws-A", texto: await appCifra(HEX_A, `mensagem secreta ${i}`) });
    }
    linhas.push({ id: "m-zzz-plano", workspace_id: "ws-A", texto: "mensagem em texto plano" });
    linhas.push({ id: "m-zzz-outra", workspace_id: "ws-A", texto: await appCifra(HEX_C, "cifrada com uma terceira chave") });
    const db = criarFakeDb({ students: [], family_medicacao_updates: [], family_laudos: [], family_mensagens: linhas });
    return { db, sb: criarFakeSupabase(db) };
  }

  it("simulação conta e não grava", async () => {
    const { db, sb } = await montar(10);
    const antes = JSON.stringify(db.tabelas.family_mensagens);
    const linhas: string[] = [];
    const r = await executar({ sb, chaveAntiga: A, chaveNova: B, modo: "simular", log: (l: string) => linhas.push(l) });
    expect(r.erros).toBe(0);
    expect(r.resumo.family_mensagens).toMatchObject({ linhas: 12, recifrado: 10, texto_plano: 1, desconhecida: 1, gravadas: 0 });
    expect(JSON.stringify(db.tabelas.family_mensagens)).toBe(antes);
    expect(db.updates).toHaveLength(0);
  });

  it("aplicar regrava (com paginação), deixa plano e desconhecido como estão e repetir não grava de novo", async () => {
    const { db, sb } = await montar(450); // mais de duas páginas de 200
    const r1 = await executar({ sb, chaveAntiga: A, chaveNova: B, modo: "aplicar", log: () => {} });
    expect(r1.erros).toBe(0);
    expect(r1.resumo.family_mensagens.gravadas).toBe(450);

    const abertas = await Promise.all(db.tabelas.family_mensagens.slice(0, 450).map((l) => appAbre(HEX_B, l.texto as string)));
    expect(abertas[0]).toBe("mensagem secreta 0");
    expect(abertas[449]).toBe("mensagem secreta 449");
    expect(db.tabelas.family_mensagens[450].texto).toBe("mensagem em texto plano");
    expect(await appAbre(HEX_C, db.tabelas.family_mensagens[451].texto as string)).toBe("cifrada com uma terceira chave");

    const r2 = await executar({ sb, chaveAntiga: A, chaveNova: B, modo: "aplicar", log: () => {} });
    expect(r2.resumo.family_mensagens.gravadas).toBe(0);
    expect(r2.resumo.family_mensagens.ja_na_nova).toBe(450);
  });

  it("verificar acusa o que não abre com a chave nova e não grava", async () => {
    const { db, sb } = await montar(5);
    await executar({ sb, chaveAntiga: A, chaveNova: B, modo: "aplicar", log: () => {} });
    const antes = db.updates.length;
    const r = await executar({ sb, chaveAntiga: A, chaveNova: B, modo: "verificar", log: () => {} });
    expect(r.resumo.family_mensagens).toMatchObject({ ja_na_nova: 5, desconhecida: 1 });
    expect(db.updates.length).toBe(antes);
  });

  it("nunca imprime valor: só contagens e nomes de tabela", async () => {
    const { db, sb } = await montar(3);
    const linhas: string[] = [];
    await executar({ sb, chaveAntiga: A, chaveNova: B, modo: "aplicar", log: (l: string) => linhas.push(l) });
    const saida = linhas.join("\n");
    expect(saida).not.toContain("mensagem secreta");
    expect(saida).not.toContain("enc:");
    for (const l of db.tabelas.family_mensagens) expect(saida).not.toContain(String(l.texto));
  });
});
