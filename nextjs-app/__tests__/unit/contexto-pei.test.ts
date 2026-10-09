/**
 * Onda 3: o PEI vira um resumo acionável para as ferramentas.
 */
import { describe, it, expect, vi } from "vitest";
vi.mock("@/lib/supabase", () => ({ getSupabase: vi.fn() }));
import { montarPerfilPei, metasDoTextoPei } from "@/lib/ferramentas/contexto-pei";

describe("montarPerfilPei", () => {
  it("leva barreiras com nível de suporte, estratégias e conclusão do estudo de caso", () => {
    const t = montarPerfilPei({
      barreiras_selecionadas: { "Funções Cognitivas": ["Atenção Sustentada/Focada"] },
      niveis_suporte: { "Atenção Sustentada/Focada": "Substancial" },
      potencias: ["Memória Visual"],
      hiperfoco: "Dinossauros",
      estrategias_ensino: ["Fragmentação de Tarefas"],
      estudo_caso: { conclusao: "Precisa de tarefas curtas", necessita_profissional_apoio: "nao" },
      ia_sugestao: "### 4. X\nabc\n### 5. 🎯 METAS SMART\n- Ler 3 frases\n### 6. Outra",
      diagnostico: "TEA",
    });
    expect(t).toContain("Atenção Sustentada/Focada (Substancial)");
    expect(t).toContain("Fragmentação de Tarefas");
    expect(t).toContain("Precisa de tarefas curtas");
    expect(t).toContain("Ler 3 frases");
    expect(t).toContain("não cite diagnóstico");
    expect(t).not.toContain("TEA");
  });

  it("PEI antigo sem campos estruturados cai para o texto do PEI", () => {
    expect(montarPerfilPei({ ia_sugestao: "Texto livre do PEI" })).toContain("Texto livre do PEI");
    expect(montarPerfilPei({})).toBe("");
  });

  it("extrai a seção de metas", () => {
    expect(metasDoTextoPei("### 5. METAS SMART\nmeta A\n### 6. fim")).toBe("meta A");
  });
});
