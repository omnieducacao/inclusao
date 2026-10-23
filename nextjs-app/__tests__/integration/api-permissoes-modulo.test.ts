/**
 * SCRUM-68 etapa 2: os métodos que gravam ou gastam IA exigem a permissão do módulo.
 * Para cada rota: um membro só com a flag do diário é barrado (403) e um membro com uma flag
 * aceita passa do guarda (qualquer status que não seja 403: o corpo vazio faz a rota recusar
 * adiante com 400/500, o que prova só que o guarda de permissão liberou).
 */
import { describe, it, expect, vi } from "vitest";

let flags: Record<string, boolean> = {};
let papel: "member" | "master" = "member";

vi.mock("@/lib/session", async (importOriginal) => {
  const real = await importOriginal<typeof import("@/lib/session")>();
  return {
    ...real,
    getSession: vi.fn(() =>
      Promise.resolve({
        workspace_id: "ws-A",
        workspace_name: "Escola A (fictícia)",
        usuario_nome: "Professora Fictícia",
        user_role: papel,
        member: { id: "mem-1", ...flags },
        is_platform_admin: false,
        terms_accepted: true,
        exp: Date.now() / 1000 + 3600,
      })
    ),
  };
});
vi.mock("@/lib/rate-limit", async (importOriginal) => {
  const real = await importOriginal<typeof import("@/lib/rate-limit")>();
  return { ...real, rateLimitResponse: () => null };
});

type Handler = (req: Request) => Promise<Response>;
const req = () =>
  new Request("http://localhost/api", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });

async function status(carregar: () => Promise<Record<string, unknown>>, metodo: string): Promise<number | "falhou-adiante"> {
  const modulo = await carregar();
  try {
    return (await (modulo[metodo] as Handler)(req())).status;
  } catch {
    return "falhou-adiante"; // passou do guarda e quebrou depois (sem banco de teste)
  }
}

const casos: Array<{ nome: string; carregar: () => Promise<Record<string, unknown>>; metodo: string; aceita: string; barraComo: string }> = [
  { nome: "POST pei/adaptar-plano", carregar: () => import("@/app/api/pei/adaptar-plano/route"), metodo: "POST", aceita: "can_pei_professor", barraComo: "can_diario" },
  { nome: "POST pei/versions", carregar: () => import("@/app/api/pei/versions/route"), metodo: "POST", aceita: "can_pei", barraComo: "can_hub" },
  { nome: "PATCH pei/versions", carregar: () => import("@/app/api/pei/versions/route"), metodo: "PATCH", aceita: "can_pei_professor", barraComo: "can_diario" },
  { nome: "POST pei/avaliacao-diagnostica", carregar: () => import("@/app/api/pei/avaliacao-diagnostica/route"), metodo: "POST", aceita: "can_avaliacao", barraComo: "can_diario" },
  { nome: "DELETE pei/avaliacao-diagnostica", carregar: () => import("@/app/api/pei/avaliacao-diagnostica/route"), metodo: "DELETE", aceita: "can_paee", barraComo: "can_hub" },
  { nome: "POST pei/avaliacao-diagnostica/salvar", carregar: () => import("@/app/api/pei/avaliacao-diagnostica/salvar/route"), metodo: "POST", aceita: "can_pei", barraComo: "can_diario" },
  { nome: "POST pei/plano-ensino", carregar: () => import("@/app/api/pei/plano-ensino/route"), metodo: "POST", aceita: "can_hub", barraComo: "can_diario" },
  { nome: "POST pei/plano-ensino/sugestao-ia (gasta IA)", carregar: () => import("@/app/api/pei/plano-ensino/sugestao-ia/route"), metodo: "POST", aceita: "can_avaliacao", barraComo: "can_diario" },
  { nome: "POST monitoring/sugerir-rubricas (gasta IA)", carregar: () => import("@/app/api/monitoring/sugerir-rubricas/route"), metodo: "POST", aceita: "can_avaliacao", barraComo: "can_diario" },
  { nome: "POST paee/relatorio-ciclo (gasta IA)", carregar: () => import("@/app/api/paee/relatorio-ciclo/route"), metodo: "POST", aceita: "can_paee", barraComo: "can_pei_professor" },
  { nome: "POST pgi/gerar-acoes (gasta IA)", carregar: () => import("@/app/api/pgi/gerar-acoes/route"), metodo: "POST", aceita: "can_gestao", barraComo: "can_paee" },
];

describe("permissão por módulo nos métodos que gravam ou gastam IA", () => {
  for (const c of casos) {
    it(`${c.nome}: sem a flag do módulo (${c.barraComo}) → 403`, async () => {
      papel = "member";
      flags = { [c.barraComo]: true };
      expect(await status(c.carregar, c.metodo)).toBe(403);
    });

    it(`${c.nome}: com ${c.aceita} passa do guarda`, async () => {
      papel = "member";
      flags = { [c.aceita]: true };
      expect(await status(c.carregar, c.metodo)).not.toBe(403);
    });
  }

  it("coordenação (master) passa em todas, sem precisar de flag", async () => {
    papel = "master";
    flags = {};
    for (const c of casos) expect(await status(c.carregar, c.metodo), c.nome).not.toBe(403);
  });
});
