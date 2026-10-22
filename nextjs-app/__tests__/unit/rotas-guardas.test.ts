/**
 * SCRUM-68: lista travada dos métodos de rota que só conferem sessão (o papel família é barrado
 * só pelo proxy.ts). Uma rota nova de equipe precisa de requireAuth(), requirePermission() ou
 * requireStaff(); se for mesmo só-sessão, entra aqui de propósito. A etapa 2 da tarefa encolhe
 * esta lista. Ver docs/ROTAS-PERMISSOES.md (gerado por scripts/rotas-guardas.mjs).
 */
import { describe, it, expect } from "vitest";
// @ts-expect-error módulo .mjs sem tipos
import { analisarRotas, SEM_GUARDA_DE_EQUIPE } from "../../scripts/rotas-guardas.mjs";

type Linha = { rota: string; metodo: string; guarda: string };

const SO_SESSAO_ATE_A_ETAPA_2 = [
  "GET /api/ai-engines/available",
  "GET /api/avaliacao-processual/evolucao",
  "POST /api/avaliacao/diagnostica/questoes",
  "GET /api/avaliacao/diagnostica",
  "POST /api/avaliacao/diagnostica",
  "GET /api/avaliacao/matriz",
  "GET /api/avaliacao/processual",
  "POST /api/avaliacao/processual",
  "POST /api/avaliacao/prova/item",
  "POST /api/avaliacao/prova/ler",
  "GET /api/avaliacao/prova",
  "PATCH /api/avaliacao/prova",
  "POST /api/avaliacao/prova",
  "GET /api/members/[id]/assignments",
  "GET /api/members/[id]/student-links",
  "POST /api/monitoring/sugerir-rubricas",
  "POST /api/paee/relatorio-ciclo",
  "GET /api/pei-regente/meus-alunos",
  "POST /api/pei/adaptar-plano",
  "POST /api/pei/avaliacao-diagnostica/salvar",
  "DELETE /api/pei/avaliacao-diagnostica",
  "GET /api/pei/avaliacao-diagnostica",
  "PATCH /api/pei/avaliacao-diagnostica",
  "POST /api/pei/avaliacao-diagnostica",
  "GET /api/pei/consolidar",
  "GET /api/pei/disciplina",
  "POST /api/pei/disciplina",
  "GET /api/pei/enviar-regentes",
  "POST /api/pei/plano-ensino/sugestao-ia",
  "POST /api/pei/plano-ensino/upload",
  "DELETE /api/pei/plano-ensino",
  "GET /api/pei/plano-ensino",
  "POST /api/pei/plano-ensino",
  "GET /api/pei/relatorio-transicao",
  "GET /api/pei/versions",
  "PATCH /api/pei/versions",
  "POST /api/pei/versions",
  "GET /api/perfil",
  "PATCH /api/perfil",
  "POST /api/pgi/gerar-acoes",
  "GET /api/pgi",
  "GET /api/plano-curso/habilidades",
  "POST /api/plano-curso",
  "GET /api/school/classes",
  "GET /api/school/components",
  "GET /api/school/grades",
  "GET /api/school/years",
  "GET /api/students/[id]/pei",
  "GET /api/students/[id]/versao",
];

describe("guardas das rotas de API", () => {
  const linhas = analisarRotas(process.cwd()) as Linha[];

  it("todo método que não é público nem da família confere a sessão", () => {
    const sem = linhas.filter((r) => r.guarda === "sem checagem de sessão").map((r) => `${r.metodo} ${r.rota}`);
    expect(sem).toEqual([]);
  });

  it("os métodos que só conferem sessão são exatamente os da lista (rota nova precisa de guarda de equipe)", () => {
    const so = linhas.filter((r) => r.guarda === SEM_GUARDA_DE_EQUIPE).map((r) => `${r.metodo} ${r.rota}`).sort();
    expect(so).toEqual([...SO_SESSAO_ATE_A_ETAPA_2].sort());
  });
});
