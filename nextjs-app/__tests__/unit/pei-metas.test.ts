import { describe, it, expect } from "vitest";
import { metasDoPei, barreirasDoPei, contextoEstruturadoDoPei } from "@/lib/pei-metas";
import { extrairMetasDoPei } from "@/lib/paee";

const TEXTO = `### 4. METAS SMART
**Curto prazo (3 meses):** Ler palavras simples com apoio visual em 80% das tentativas.
**Médio prazo (6 meses):** Ler frases curtas com autonomia.
**Longo prazo (1 ano):** Compreender textos curtos da turma.
### 5. ESTRATÉGIAS
- Usar pistas visuais`;

describe("metasDoPei (onda 16)", () => {
  it("usa as metas gravadas quando existem", () => {
    const m = metasDoPei({ metas: [{ id: "x", tipo: "LEITURA", descricao: "Ler sílabas" }] });
    expect(m).toEqual([{ id: "x", tipo: "LEITURA", descricao: "Ler sílabas", prioridade: "media", selecionada: true }]);
  });

  it("tira as metas SMART do texto do PEI e as metas das disciplinas consolidadas", () => {
    const m = metasDoPei({
      ia_sugestao: TEXTO,
      consolidacao: { em: "2026-10-09", disciplinas: [{ disciplina: "Matemática", metas: ["Somar com material concreto"] }] },
    });
    expect(m.map((x) => x.tipo)).toEqual(["CURTO PRAZO", "MÉDIO PRAZO", "LONGO PRAZO", "MATEMÁTICA"]);
    expect(m[0].descricao).toContain("palavras simples");
    expect(m[3].descricao).toBe("Somar com material concreto");
  });

  it("o PAEE deixa de inventar meta genérica quando o PEI tem metas", () => {
    const m = extrairMetasDoPei({ ia_sugestao: TEXTO });
    expect(m.some((x) => x.descricao.startsWith("Desenvolver habilidades específicas"))).toBe(false);
    expect(m).toHaveLength(3);
  });
});

describe("barreirasDoPei", () => {
  it("junta cada barreira ao nível de suporte (chave domínio_barreira)", () => {
    const b = barreirasDoPei({
      barreiras_selecionadas: { Comunicação: ["Linguagem oral"], Acesso: [] },
      niveis_suporte: { "Comunicação_Linguagem oral": "Substancial" },
    });
    expect(b).toEqual([{ dominio: "Comunicação", barreira: "Linguagem oral", nivel: "Substancial" }]);
  });

  it("o contexto para a IA traz metas, barreiras e potencialidades", () => {
    const t = contextoEstruturadoDoPei({
      ia_sugestao: TEXTO,
      barreiras_selecionadas: { Comunicação: ["Linguagem oral"] },
      potencias: ["Memória visual"],
    });
    expect(t).toContain("METAS DO PEI");
    expect(t).toContain("Comunicação: Linguagem oral");
    expect(t).toContain("Memória visual");
  });
});
