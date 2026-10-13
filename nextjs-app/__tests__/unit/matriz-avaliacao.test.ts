import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { siglaDoCodigo, siglaOmni, type ComponenteOmni } from "@/lib/matriz-omni";
import { lerSerie, componenteOficial, matrizDoComponente, nivelDoComponente, sugestoesDeMeta } from "@/lib/matriz-avaliacao";
import { itensDaMatriz, itensLegado, maisParecido, itemPorCodigo, saebDoItem } from "@/lib/matriz-avaliacao-servidor";
import { ESCALA_OMNISFERA } from "@/lib/omnisfera-types";
import { MATRIZES_SAEB } from "@/lib/matriz-saeb";

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

describe("Matemática revisada (Saeb–BNCC 2022 + Bloom)", () => {
  const ma = comps.find((c) => c.sigla === "MA")!;
  const saeb = MATRIZES_SAEB.filter((m) => m.componente === "Matemática").flatMap((m) => m.descritores.map((d) => d.codigo));
  const bloom = ["lembrar", "entender", "aplicar", "analisar", "avaliar", "criar"];

  it("código no padrão do Saeb, com eixo cognitivo e Bloom coerentes", () => {
    for (const d of ma.descritores) {
      const m = /^OMNI-MA(\d)-([NAGME])([12])\.\d+$/.exec(d.codigo);
      expect(m, d.codigo).not.toBeNull();
      expect(d.ano).toBe(`${m![1]}º ano`);
      expect(d.eixo_cognitivo).toBe(Number(m![3]));
      expect(bloom).toContain(d.bloom);
      expect(/^(Compreender|Conhecer|Saber|Entender|Interpretar)\b/.test(d.descritor), d.codigo).toBe(false);
    }
  });

  it("cada ano cobre toda a BNCC de Matemática do ano, os cinco eixos e os dois eixos cognitivos", () => {
    for (let a = 1; a <= 9; a++) {
      const doAno = ma.descritores.filter((d) => d.ano === `${a}º ano`);
      const cobertas = new Set(doAno.flatMap((d) => d.habilidades_bncc));
      for (const h of bnccEf) if (h.startsWith(`EF0${a}MA`)) expect(cobertas.has(h), `${a}º ano ${h}`).toBe(true);
      expect(new Set(doAno.map((d) => d.eixo)).size).toBe(5);
      expect(new Set(doAno.map((d) => d.eixo_cognitivo))).toEqual(new Set([1, 2]));
    }
  });

  it("2º, 5º e 9º ano cobrem todas as habilidades do Saeb 2022", () => {
    const cobertos = new Set(ma.descritores.flatMap((d) => d.saeb));
    expect(saeb.length).toBe(148);
    for (const s of saeb) expect(cobertos.has(s), s).toBe(true);
  });

  it("todo código antigo aponta para descritores novos que existem", () => {
    const novos = new Set(ma.descritores.map((d) => d.codigo));
    expect(ma.substituidos?.length).toBe(144);
    for (const d of ma.substituidos!) {
      expect(d.substituido_por.length).toBeGreaterThan(0);
      for (const c of d.substituido_por) expect(novos.has(c), `${d.codigo} → ${c}`).toBe(true);
    }
  });
});

describe("Linguagens revisadas (Saeb–BNCC 2022: LP, Arte, Educação Física, Inglês)", () => {
  const bloom = ["lembrar", "entender", "aplicar", "analisar", "avaliar", "criar"];
  const FAIXA: Record<string, string> = { "15": "1º ao 5º ano", "69": "6º ao 9º ano", "12": "1º e 2º ano", "35": "3º ao 5º ano", "67": "6º e 7º ano", "89": "8º e 9º ano" };
  for (const sigla of ["LP", "AR", "EF", "LI"]) {
    const comp = comps.find((c) => c.sigla === sigla)!;
    it(`${sigla}: código no padrão do Saeb, eixo cognitivo 1–4, Bloom e códigos antigos substituídos`, () => {
      for (const d of comp.descritores) {
        const m = new RegExp(`^OMNI-${sigla}(\\d{1,2})-[A-Z]([1-4])\\.\\d+$`).exec(d.codigo);
        expect(m, d.codigo).not.toBeNull();
        expect(d.ano).toBe(m![1].length === 1 ? `${m![1]}º ano` : FAIXA[m![1]]);
        expect(d.eixo_cognitivo).toBe(Number(m![2]));
        expect(bloom).toContain(d.bloom);
      }
      const novos = new Set(comp.descritores.map((d) => d.codigo));
      expect(comp.substituidos!.length).toBeGreaterThan(0);
      for (const d of comp.substituidos!) for (const c of d.substituido_por) expect(novos.has(c), c).toBe(true);
    });
    it(`${sigla}: cobre toda a BNCC do componente e todo o Saeb 2022 do componente`, () => {
      const cobertas = new Set(comp.descritores.flatMap((d) => d.habilidades_bncc));
      for (const h of bnccEf) if (h.slice(4, 6) === sigla) expect(cobertas.has(h), h).toBe(true);
      const cobertos = new Set(comp.descritores.flatMap((d) => d.saeb));
      for (const m of MATRIZES_SAEB.filter((x) => x.componente === comp.componente)) for (const s of m.descritores) expect(cobertos.has(s.codigo), s.codigo).toBe(true);
    });
  }
});

describe("Ciências, História e Geografia revisadas (Saeb – Documentos de Referência 2018)", () => {
  const bloom = ["lembrar", "entender", "aplicar", "analisar", "avaliar", "criar"];
  const cruzamentos = (comp: string, ano: string) =>
    new Set(MATRIZES_SAEB.filter((m) => m.componente === comp && m.ano === ano).flatMap((m) => m.descritores.map((d) => d.codigo.slice(4, 6))));
  for (const sigla of ["CI", "HI", "GE"]) {
    const comp = comps.find((c) => c.sigla === sigla)!;
    it(`${sigla}: código no padrão do Saeb, eixo cognitivo 1–3, Bloom, BNCC completa e códigos antigos substituídos`, () => {
      for (const d of comp.descritores) {
        const m = new RegExp(`^OMNI-${sigla}(\\d)-[A-Z]([1-3])\\.\\d+$`).exec(d.codigo);
        expect(m, d.codigo).not.toBeNull();
        expect(d.ano).toBe(`${m![1]}º ano`);
        expect(d.eixo_cognitivo).toBe(Number(m![2]));
        expect(bloom).toContain(d.bloom);
      }
      const cobertas = new Set(comp.descritores.flatMap((d) => d.habilidades_bncc));
      for (const h of bnccEf) if (h.slice(4, 6) === sigla) expect(cobertas.has(h), h).toBe(true);
      const novos = new Set(comp.descritores.map((d) => d.codigo));
      for (const d of comp.substituidos!) for (const c of d.substituido_por) expect(novos.has(c), c).toBe(true);
    });
  }
  it("5º e 9º ano: todo cruzamento do Saeb (eixo cognitivo × eixo do conhecimento) aparece na matriz", () => {
    const ci = comps.find((c) => c.sigla === "CI")!;
    const ch = comps.filter((c) => c.sigla === "HI" || c.sigla === "GE");
    for (const ano of ["5º ano", "9º ano"]) {
      const cn = new Set(ci.descritores.filter((d) => d.ano === ano).flatMap((d) => d.saeb.map((s) => s.slice(4, 6))));
      for (const x of cruzamentos("Ciências", ano)) expect(cn.has(x), `CN ${ano} ${x}`).toBe(true);
      const hum = new Set(ch.flatMap((c) => c.descritores).filter((d) => d.ano === ano).flatMap((d) => d.saeb.map((s) => s.slice(4, 6))));
      for (const x of cruzamentos("Ciências Humanas", ano)) expect(hum.has(x), `CH ${ano} ${x}`).toBe(true);
    }
  });
  it("acha o texto do Saeb ilustrativo pelo código", () => {
    const item = comps.find((c) => c.sigla === "CI")!.descritores.find((d) => d.saeb.length && d.ano === "5º ano")!;
    expect(saebDoItem("Ciências", item).length).toBe(item.saeb.length);
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
    expect(r!.itens.length).toBeGreaterThanOrEqual(30);
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
    const it6 = await itemPorCodigo("OMNI-MA6-N1.1", "Matemática", "EF", 7);
    expect(it6?.codigo).toBe("OMNI-MA6-N1.1");
    // código antigo (substituído) continua sendo lido, para avaliações já gravadas
    const antigo = await itemPorCodigo("OMNI-MA6-D01", "Matemática", "EF", 7);
    expect(antigo?.codigo).toBe("OMNI-MA6-D01");
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
