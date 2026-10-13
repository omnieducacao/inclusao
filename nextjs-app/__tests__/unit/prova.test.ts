import { describe, it, expect } from "vitest";
import { corrigirProva, extrairJson, nivelSugerido, normalizarItens, codigoCurto, distribuirGabaritos, RUBRICA_PADRAO, type ItemProva, type RespostaItem } from "@/lib/prova";
import { pdfEstudante, pdfProfessora } from "@/lib/prova-pdf";

const alt = (n: number) => ["A", "B", "C", "D"].slice(0, n).map((l) => ({ letra: l as "A", texto: `opção ${l}` }));
const i1: ItemProva = { id: "a", codigo: "X", ordem: 1, tipo: "objetiva", enunciado: "com apoio", alternativas: alt(3), gabarito: "B" };
const i2: ItemProva = { id: "b", codigo: "X", ordem: 2, tipo: "objetiva", enunciado: "sem apoio", alternativas: alt(4), gabarito: "D" };
const r = (marcada: RespostaItem["marcada"], apoio: RespostaItem["apoio"] = "nenhum"): RespostaItem => ({ marcada, apoio, fonte: "grade" });

describe("nível sugerido (acerto + apoio)", () => {
  const casos: Array<[string, Record<string, RespostaItem>, number | null]> = [
    ["acertou as duas sem apoio", { a: r("B"), b: r("D") }, 4],
    ["acertou a sem apoio, errou a com apoio", { a: r("A"), b: r("D") }, 3],
    ["acertou a sem apoio com apoio leve", { a: r("B"), b: r("D", "leve") }, 3],
    ["acertou a sem apoio só com apoio total", { a: r("B"), b: r("D", "total") }, 2],
    ["acertou só a com apoio", { a: r("B"), b: r("A") }, 2],
    ["acertou só a com apoio, e com apoio total", { a: r("B", "total"), b: r("A") }, 1],
    ["errou as duas", { a: r("C"), b: r("A") }, 1],
    ["em branco nas duas", { a: r(null), b: r(null) }, 0],
    ["falta corrigir uma", { a: r("B") }, null],
  ];
  for (const [nome, resp, esperado] of casos) it(nome, () => expect(nivelSugerido([i1, i2], resp)).toBe(esperado));

  it("abertas: vale a rubrica, rebaixada pelo apoio", () => {
    const ab: ItemProva = { id: "c", codigo: "Y", ordem: 1, tipo: "aberta", enunciado: "escreva" };
    expect(nivelSugerido([ab], { c: { nivel: 4, apoio: "nenhum", fonte: "rubrica" } })).toBe(4);
    expect(nivelSugerido([ab], { c: { nivel: 4, apoio: "leve", fonte: "rubrica" } })).toBe(3);
    expect(nivelSugerido([ab], { c: { nivel: 3, apoio: "total", fonte: "ia" } })).toBe(1);
  });

  it("corrigirProva traz nível e evidência por descritor", () => {
    const res = corrigirProva({ descritores: [{ codigo: "X", descritor: "Somar" }], itens: [i1, i2], respostas: { a: r("B"), b: r("C", "leve") } });
    expect(res[0]).toMatchObject({ codigo: "X", nivel: 2, completo: true });
    expect(res[0].evidencia).toContain("Q2 errada (marcou C) com apoio leve");
  });
});

describe("itens vindos da IA", () => {
  it("extrai o JSON mesmo com cercas e texto em volta", () => {
    expect(extrairJson('Aqui está:\n```json\n[{"a":1}]\n```')).toEqual([{ a: 1 }]);
    expect(extrairJson("nada")).toBeNull();
  });

  it("normaliza, descarta itens quebrados e repete no máximo um item por ordem", () => {
    let n = 0;
    const itens = normalizarItens([
      { codigo: "X", ordem: 1, tipo: "objetiva", enunciado: "Quanto é 2+2?", alternativas: [{ texto: "3", erro: "contou um a menos" }, { texto: "4" }, { texto: "5" }], gabarito: "b" },
      { codigo: "X", ordem: 1, tipo: "objetiva", enunciado: "repetido", alternativas: ["1", "2", "3"], gabarito: "A" },
      { codigo: "X", ordem: 2, tipo: "objetiva", enunciado: "sem gabarito válido", alternativas: ["1", "2", "3"], gabarito: "D" },
      { codigo: "Y", ordem: 2, tipo: "aberta", enunciado: "Explique.", rubrica: [] },
      { codigo: "Z", ordem: 1, tipo: "objetiva", enunciado: "fora da prova", alternativas: ["1", "2", "3"], gabarito: "A" },
    ], ["X", "Y"], () => `id${++n}`);
    expect(itens.map((i) => `${i.codigo}${i.ordem}`)).toEqual(["X1", "Y2"]);
    expect(itens[0]).toMatchObject({ gabarito: "B", alternativas: [{ letra: "A", erro: "contou um a menos" }, { letra: "B" }, { letra: "C" }] });
    expect(itens[1].rubrica).toHaveLength(5);
  });

  it("código curto sem letras que confundem", () => {
    expect(codigoCurto()).toMatch(/^[A-HJKMNP-Z2-9]{6}$/);
  });
});

describe("PDFs da prova", () => {
  const prova = {
    id: "p", codigo_curto: "ABC234", tipo: "diagnostica" as const, student_id: "s", disciplina: "Matemática", ano_referencia: "5º ano",
    descritores: [{ codigo: "X", descritor: "Somar números naturais" }],
    itens: [i1, { ...i2, texto_base: "João tinha 3 balas e ganhou mais 2." }, { id: "c", codigo: "X", ordem: 2 as const, tipo: "aberta" as const, enunciado: "Explique como você pensou." }],
    adaptacoes: { fonte: "ampliada" as const, umaPorPagina: true, linhasResposta: 5 },
    respostas: {},
  };
  it("caderno do estudante: uma questão por página + folha de respostas", () => {
    const doc = pdfEstudante(prova, "Laura Teste");
    expect(doc.getNumberOfPages()).toBe(4);
    expect(doc.output("arraybuffer").byteLength).toBeGreaterThan(2000);
  });
  it("guia da professora", () => {
    const doc = pdfProfessora(prova, "Laura Teste", prova.descritores);
    expect(doc.getNumberOfPages()).toBeGreaterThanOrEqual(1);
  });
});

describe("distribuirGabaritos", () => {
  const obj = (n: number, alts: number): ItemProva => ({
    id: `i${n}`, codigo: "OMNI-MA4-N1.1", ordem: (n % 2 ? 1 : 2) as 1 | 2, tipo: "objetiva", enunciado: `Q${n}`,
    alternativas: (["A", "B", "C", "D"] as const).slice(0, alts).map((l, k) => ({ letra: l, texto: k === 0 ? `certa${n}` : `errada${n}-${k}`, ...(k ? { erro: `erro${k}` } : {}) })),
    gabarito: "A",
  });
  it("tira a certa do A, equilibra as letras e preserva o texto da certa", () => {
    let s = 7; const rand = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
    const itens = Array.from({ length: 12 }, (_, i) => obj(i, i % 2 ? 3 : 4));
    const saida = distribuirGabaritos(itens, rand);
    const cont: Record<string, number> = {};
    saida.forEach((it, i) => {
      const certa = it.alternativas!.find((a) => a.letra === it.gabarito)!;
      expect(certa.texto).toBe(`certa${i}`);
      expect(certa.erro).toBeUndefined();
      expect(it.alternativas!.map((a) => a.letra)).toEqual(["A", "B", "C", "D"].slice(0, it.alternativas!.length));
      cont[it.gabarito!] = (cont[it.gabarito!] || 0) + 1;
    });
    expect(Object.keys(cont).length).toBeGreaterThanOrEqual(3);
    expect(Math.max(...Object.values(cont))).toBeLessThanOrEqual(4);
    for (let i = 1; i < saida.length; i++) expect(saida[i].gabarito).not.toBe(saida[i - 1].gabarito);
  });
  it("não mexe em abertas", () => {
    const aberta: ItemProva = { id: "x", codigo: "c", ordem: 1, tipo: "aberta", enunciado: "e", rubrica: RUBRICA_PADRAO };
    expect(distribuirGabaritos([aberta])[0]).toBe(aberta);
  });
});

describe("PDF: símbolos de matemática", () => {
  it("mantém o sinal de menos e troca ≥ por >=", () => {
    const prova = { id: "x", codigo_curto: "ABC234", tipo: "diagnostica" as const, student_id: "s", disciplina: "Matemática", ano_referencia: "4º ano", descritores: [], respostas: {}, adaptacoes: { fonte: "normal" as const, umaPorPagina: false, linhasResposta: 5 },
      itens: [{ id: "1", codigo: "c", ordem: 1 as const, tipo: "objetiva" as const, enunciado: "Calcule 15 000 − 4 000 ≥ 3", alternativas: [{ letra: "A" as const, texto: "a" }, { letra: "B" as const, texto: "b" }, { letra: "C" as const, texto: "c" }], gabarito: "A" as const }] };
    expect(pdfEstudante(prova, "Teste").output()).toContain("15 000 - 4 000 >= 3");
  });
});
