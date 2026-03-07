/**
 * Testes Unitários — Audit Log (lib/audit.ts)
 *
 * Cobertura:
 * - logAction basic structure
 * - logExport wrapper
 * - logStudentAccess wrapper
 * - Never throws (graceful failure)
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock getSupabase
const mockInsert = vi.fn().mockResolvedValue({ data: null, error: null });
const mockFrom = vi.fn().mockReturnValue({ insert: mockInsert });

vi.mock("@/lib/supabase", () => ({
    getSupabase: () => ({ from: mockFrom }),
}));

import { logAction, logExport, logStudentAccess } from "@/lib/audit";

describe("Audit Log — lib/audit.ts", () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("logAction", () => {
        it("insere registro na tabela audit_log", async () => {
            await logAction({
                workspaceId: "ws-123",
                actorName: "Professor João",
                actorRole: "master",
                action: "view",
                resourceType: "student",
                resourceId: "student-abc",
            });

            expect(mockFrom).toHaveBeenCalledWith("audit_log");
            expect(mockInsert).toHaveBeenCalledWith({
                workspace_id: "ws-123",
                actor_id: "Professor João",
                actor_role: "master",
                action: "view",
                resource_type: "student",
                resource_id: "student-abc",
                metadata: {},
                ip_address: null,
            });
        });

        it("trata campos opcionais como null", async () => {
            await logAction({
                action: "login",
                resourceType: "session",
            });

            expect(mockInsert).toHaveBeenCalledWith(
                expect.objectContaining({
                    workspace_id: null,
                    actor_id: null,
                    actor_role: null,
                    resource_id: null,
                })
            );
        });

        it("nunca lança exceção (graceful failure)", async () => {
            mockInsert.mockRejectedValueOnce(new Error("DB connection error"));

            // Should not throw
            await expect(logAction({
                action: "view",
                resourceType: "student",
            })).resolves.toBeUndefined();
        });
    });

    describe("logExport", () => {
        it("registra ação de exportação com formato", async () => {
            await logExport({
                workspaceId: "ws-123",
                actorName: "Admin",
                actorRole: "master",
                resourceType: "student",
                resourceId: "student-abc",
                format: "json",
            });

            expect(mockInsert).toHaveBeenCalledWith(
                expect.objectContaining({
                    action: "export",
                    metadata: { format: "json" },
                })
            );
        });

        it("usa formato json como default", async () => {
            await logExport({
                workspaceId: "ws-123",
                actorName: "Admin",
                actorRole: "master",
                resourceType: "student",
                resourceId: "student-abc",
            });

            expect(mockInsert).toHaveBeenCalledWith(
                expect.objectContaining({
                    metadata: { format: "json" },
                })
            );
        });
    });

    describe("logStudentAccess", () => {
        it("registra acesso a dados do estudante com módulo", async () => {
            await logStudentAccess({
                workspaceId: "ws-123",
                actorName: "Professor Maria",
                actorRole: "member",
                studentId: "student-xyz",
                module: "pei",
            });

            expect(mockInsert).toHaveBeenCalledWith(
                expect.objectContaining({
                    action: "view",
                    resource_type: "student",
                    resource_id: "student-xyz",
                    metadata: { module: "pei" },
                })
            );
        });
    });
});
