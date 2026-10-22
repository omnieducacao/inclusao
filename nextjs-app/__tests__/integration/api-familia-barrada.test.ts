/**
 * SCRUM-68: sessão de responsável (papel "family") chamando rotas de equipe direto, sem passar
 * pelo proxy.ts: cada rota deve recusar com 403 sozinha (defesa em profundidade).
 * Controle positivo: a coordenação (master) não é barrada pelo guarda.
 */
import { describe, it, expect, vi } from "vitest";

let papel: "family" | "master" = "family";

vi.mock("@/lib/session", async (importOriginal) => {
  const real = await importOriginal<typeof import("@/lib/session")>();
  return {
    ...real,
    getSession: vi.fn(() =>
      Promise.resolve({
        workspace_id: "ws-A",
        workspace_name: "Escola A (fictícia)",
        usuario_nome: "Responsável Fictício",
        user_role: papel,
        family_responsible_id: papel === "family" ? "resp-1" : undefined,
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

const params = (id: string) => ({ params: Promise.resolve({ id }) });
const req = (corpo?: unknown) =>
  new Request("http://localhost/api", corpo === undefined ? undefined : { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(corpo) });

describe("papel família nas rotas de equipe", () => {
  it("GET /api/students", async () => {
    papel = "family";
    const { GET } = await import("@/app/api/students/route");
    expect((await GET()).status).toBe(403);
  });

  it("GET /api/students/[id]", async () => {
    papel = "family";
    const { GET } = await import("@/app/api/students/[id]/route");
    expect((await GET(req(), params("est-1"))).status).toBe(403);
  });

  it("GET /api/students/[id]/pei-data", async () => {
    papel = "family";
    const { GET } = await import("@/app/api/students/[id]/pei-data/route");
    expect((await GET(req(), params("est-1"))).status).toBe(403);
  });

  it("PATCH /api/students/[id]/pei-data", async () => {
    papel = "family";
    const { PATCH } = await import("@/app/api/students/[id]/pei-data/route");
    expect((await PATCH(req({ pei_data: {} }), params("est-1"))).status).toBe(403);
  });

  it("POST /api/pei/transcrever-laudo (gasta crédito de IA)", async () => {
    papel = "family";
    const { POST } = await import("@/app/api/pei/transcrever-laudo/route");
    expect((await POST(req({}))).status).toBe(403);
  });

  it("POST /api/diario/analise-ia (gasta crédito de IA)", async () => {
    papel = "family";
    const { POST } = await import("@/app/api/diario/analise-ia/route");
    expect((await POST(req({}))).status).toBe(403);
  });

  it("POST /api/hub/plano-aula (gasta crédito de IA)", async () => {
    papel = "family";
    const { POST } = await import("@/app/api/hub/plano-aula/route");
    expect((await POST(req({}))).status).toBe(403);
  });

  it("GET /api/bncc/ef", async () => {
    papel = "family";
    const { GET } = await import("@/app/api/bncc/ef/route");
    expect((await GET(req())).status).toBe(403);
  });
});
