/**
 * Testes de Integração - API /api/familia/ciencia-pei
 *
 * POST: Registra ciência do PEI pela família
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

let mockLinkData: { id: string } | null = { id: "link-1" };
let mockAckExists: { id: string } | null = null;
let mockInsertError: Error | null = null;

vi.mock("@/lib/supabase", () => ({
  getSupabase: vi.fn(() => ({
    from: vi.fn((table: string) => {
      if (table === "family_student_links") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: vi.fn(() =>
                  Promise.resolve({ data: mockLinkData, error: null })
                ),
              })),
            })),
          })),
        };
      }
      if (table === "family_pei_acknowledgments") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: vi.fn(() =>
                  Promise.resolve({ data: mockAckExists, error: null })
                ),
              })),
            })),
          })),
          insert: vi.fn(() =>
            mockInsertError
              ? Promise.resolve({ error: mockInsertError })
              : Promise.resolve({ error: null })
          ),
        };
      }
      return {};
    }),
  })),
}));

let mockSession: {
  workspace_id: string;
  user_role: string;
  family_responsible_id?: string;
} | null = null;

vi.mock("@/lib/session", () => ({
  getSession: vi.fn(() => Promise.resolve(mockSession)),
}));

import { POST } from "@/app/api/familia/ciencia-pei/route";

describe("API /api/familia/ciencia-pei", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSession = {
      workspace_id: "ws-1",
      user_role: "family",
      family_responsible_id: "resp-1",
    };
    mockLinkData = { id: "link-1" };
    mockAckExists = null;
    mockInsertError = null;
  });

  it("retorna 401 quando não autenticado", async () => {
    mockSession = null;

    const res = await POST(
      new Request("http://localhost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: "est-1" }),
      })
    );

    expect(res.status).toBe(401);
  });

  it("retorna 400 quando student_id ausente", async () => {
    const res = await POST(
      new Request("http://localhost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
    );

    expect(res.status).toBe(400);
  });

  it("retorna 403 quando estudante não vinculado", async () => {
    mockLinkData = null;

    const res = await POST(
      new Request("http://localhost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: "est-1" }),
      })
    );

    expect(res.status).toBe(403);
  });

  it("retorna 200 quando ciência já registrada", async () => {
    mockAckExists = { id: "ack-1" };

    const res = await POST(
      new Request("http://localhost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: "est-1" }),
      })
    );

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.acknowledged).toBe(true);
  });

  it("registra ciência com sucesso", async () => {
    const res = await POST(
      new Request("http://localhost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: "est-1" }),
      })
    );

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.acknowledged).toBe(true);
    expect(data.message).toContain("sucesso");
  });
});
