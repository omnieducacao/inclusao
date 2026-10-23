/**
 * SCRUM-68: lista travada dos métodos de rota que só conferem sessão (o papel família é barrado
 * só pelo proxy.ts). Uma rota nova de equipe precisa de requireAuth(), requirePermission(),
 * requireAnyPermission() ou requireStaff(); se for mesmo só-sessão (leitura por vínculo ou do
 * próprio usuário), entra aqui de propósito. Ver docs/ROTAS-PERMISSOES.md (gerado por scripts/rotas-guardas.mjs).
 */
import { describe, it, expect } from "vitest";
// @ts-expect-error módulo .mjs sem tipos
import { analisarRotas, SEM_GUARDA_DE_EQUIPE } from "../../scripts/rotas-guardas.mjs";

type Linha = { rota: string; metodo: string; guarda: string };

const SO_SESSAO = [
  "GET /api/ai-engines/available",
  "GET /api/avaliacao-processual/evolucao",
  "GET /api/members/[id]/assignments",
  "GET /api/members/[id]/student-links",
  "GET /api/pei-regente/meus-alunos",
  "GET /api/pei/avaliacao-diagnostica",
  "GET /api/pei/consolidar",
  "GET /api/pei/disciplina",
  "POST /api/pei/disciplina",
  "GET /api/pei/enviar-regentes",
  "GET /api/pei/plano-ensino",
  "GET /api/pei/relatorio-transicao",
  "GET /api/pei/versions",
  "GET /api/perfil",
  "PATCH /api/perfil",
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
    expect(so).toEqual([...SO_SESSAO].sort());
  });
});
