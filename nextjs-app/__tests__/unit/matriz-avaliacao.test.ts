import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { siglaDoCodigo, siglaOmni, type ComponenteOmni } from "@/lib/matriz-omni";
import { lerSerie, componenteOficial, matrizDoComponente, nivelDoComponente, sugestoesDeMeta } from "@/lib/matriz-avaliacao";
import { itensDaMatriz, itensLegado, maisParecido, itemPorCodigo } from "@/lib/matriz-avaliacao-servidor";
import { ESCALA_OMNISFERA } from "@/lib/omnisfera-types";

const dir = join(process.cwd(), "data", "matriz-omni");
const SIGLAS = ["LP", "MA", "CI", "HI", "GE", "AR", "EF", "LI"];
const comps: ComponenteOmni[] = SIGLAS.map((s) => JSON.parse(readFileSync(join(dir, `${s}.json`), "utf8")));
const bnccEf = new Set((JSON.parse(readFileSync(join(process.cwd(), "data", "bncc_ef.json"), "utf8")) as Array<{ codigo: string }>).map((h) => h.codigo));

describe("Matriz Omni na Omnisfera (onda 17)", () => {
  it("tem as 8 disciplinas, códigos únicos e no formato", () => {
    const codigos = comps.flatMap((c) => c.descritores.map((d) => d.codigo));
    expect(new Set(codigos).size).toBe(codigos.length);
    expect(codigos.length).toBeGreaterThan(600);
    for (const c of comps) {
      expect(siglaOmni(c.componente)).toBe(c.sigla);
      for (const d of c.descritores) expect(siglaDoCodigo(d.codigo)).toBe(c.sigla);
    }
  });

  it("quase toda habilidade da BNCC citada existe na BNCC da Omnisfera", () => {
    const citadas = comps.flatMap((c) => c.descritores.flatMap((d) => d.habilidades_bncc));
    const achadas = citadas.filter((h) => bnccEf.has(h)).length;
    expect(achadas / citadas.length).toBeGreaterThan(0.95);
  });

  it("a escala do índice é a mesma da Omnisfera", () => {
    const idx = JSON.parse(readFileSync(join(dir, "indice.json"), "utf8")) as { escala: Array<{ nivel: 0 | 1 | 2 | 3 | 4; label: string }> };
    for (const e of idx.escala) expect(e.label).toBe(ESCALA_OMNISFERA[e.nivel].label);
  });
});

describe("série, componente e matriz", () => {
  it("lê as séries como a escola escreve", () => {
    expect(lerSerie("7º Ano (EFAF)")).toMatchObject({ etapa: "EF", ano: 7 });
    expect(lerSerie("4º Ano (EFAI)")).toMatchObject({ etapa: "EF", ano: 4 });
    expect(lerSerie("2ª Série (EM)")).toMatchObject({ etapa: "EM", ano: 2 });
    expect(lerSerie("Educação Infantil (5 anos)").etapa).toBe("EI");
  });

  it("normaliza o nome da disciplina e escolhe a matriz", () => {
    expect(componenteOficial("português")).toBe("Língua Portuguesa");
    expect(componenteOficial("Ed. Física")).toBe("Educação Física");
    expect(matrizDoComponente("Matemática", "EF")).toEqual({ fonte: "omni", chave: "MA" });
    expect(matrizDoComponente("Biologia", "EM")).toEqual({ fonte: "enem", chave: "CN" });
    expect(matrizDoComponente("Matemática", "EI")).toBeNull();
  });

  it("nível do componente é a mediana (para baixo) e as sugestões são os níveis 0–2", () => {
    expect(nivelDoComponente([{ nivel: 1 }, { nivel: 4 }, { nivel: 2 }])).toBe(2);
    expect(nivelDoComponente([{ nivel: 1 }, { nivel: 2 }])).toBe(1);
    expect(nivelDoComponente([{ nivel: null }])).toBeNull();
    const s = sugestoesDeMeta("Matemática", [
      { codigo: "A", descritor: "a", eixo: "", nivel: 3 },
      { codigo: "B", descritor: "b", eixo: "", nivel: 0 },
      { codigo: "C", descritor: "c", eixo: "", nivel: 2 },
    ]);
    expect(s.map((x) => x.codigo)).toEqual(["B", "C"]);
  });
});

describe("itens da matriz no servidor", () => {
  it("EF: descritores Omni do ano de referência", async () => {
    const r = await itensDaMatriz({ componente: "Matemática", etapa: "EF", ano: 7 });
    expect(r?.fonte).toBe("omni");
    expect(r!.itens.length).toBe(16);
    expect(r!.itens.every((i) => i.codigo.startsWith("OMNI-MA7-"))).toBe(true);
  });

  it("EM: Matriz do ENEM (30 habilidades em Matemática) e a BNCC como opção", async () => {
    const enem = await itensDaMatriz({ componente: "Matemática", etapa: "EM", ano: 2 });
    expect(enem?.fonte).toBe("enem");
    expect(enem!.itens).toHaveLength(30);
    const bncc = await itensDaMatriz({ componente: "Matemática", etapa: "EM", ano: 2, fonte: "bncc" });
    expect(bncc?.fonte).toBe("bncc");
    expect(bncc!.itens.length).toBeGreaterThan(0);
    expect(bncc!.itens[0].codigo).toMatch(/^EM13MAT/);
  });

  it("acha o item pelo código, mesmo em outro ano de referência", async () => {
    const it6 = await itemPorCodigo("OMNI-MA6-D01", "Matemática", "EF", 7);
    expect(it6?.codigo).toBe("OMNI-MA6-D01");
    expect(await itemPorCodigo("INVENTADO", "Matemática", "EF", 7)).toBeNull();
  });

  it("confronto: a matriz antiga só existe do 4º ao 9º e acha o par mais parecido", async () => {
    const leg = await itensLegado("Matemática", 5);
    expect(leg.length).toBeGreaterThan(10);
    expect(await itensLegado("Matemática", 2)).toEqual([]);
    const omni = await itensDaMatriz({ componente: "Matemática", etapa: "EF", ano: 5 });
    const par = maisParecido(omni!.itens[0], leg);
    expect(par?.item.serie).toBe("EF5");
  });
});
