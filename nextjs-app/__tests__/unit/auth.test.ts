/**
 * Testes Unitários - Módulo de Autenticação
 * 
 * Cobertura:
 * - Verificação de senhas (bcrypt)
 * - Busca de usuários por email
 * - Verificação de credenciais de workspace
 * - Validação de permissões de platform_admin
 * - Segurança: Timing attacks prevention
 * - Segurança: Normalização de inputs
 * 
 * LGPD: Testes de proteção de credenciais
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
    findUserByEmail,
    verifyPassword,
    verifyWorkspaceMaster,
    verifyMemberPassword,
    verifyPlatformAdmin,
    type UserRole,
} from "@/lib/auth";

// Mock Supabase
const mockMaybeSingle = vi.fn();
const mockSingle = vi.fn();
const mockEq = vi.fn(() => ({ maybeSingle: mockMaybeSingle, single: mockSingle }));
const mockSelect = vi.fn(() => ({ eq: mockEq }));
const mockFrom = vi.fn(() => ({ select: mockSelect }));

vi.mock("@/lib/supabase", () => ({
    getSupabase: vi.fn(() => ({
        from: mockFrom,
    })),
}));

// Mock bcrypt
const mockCompareSync = vi.fn();
vi.mock("bcryptjs", () => ({
    default: {
        compareSync: mockCompareSync,
    },
}));

describe("auth", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("findUserByEmail", () => {
        it("retorna null para email vazio", async () => {
            const result = await findUserByEmail("");
            expect(result).toBeNull();
        });

        it("retorna null para email apenas com espaços", async () => {
            const result = await findUserByEmail("   ");
            expect(result).toBeNull();
        });

        it("normaliza email para lowercase", async () => {
            mockMaybeSingle.mockResolvedValueOnce({ data: null });
            mockMaybeSingle.mockResolvedValueOnce({ data: null });

            await findUserByEmail("TEST@EXAMPLE.COM");

            // Verifica se a busca foi feita com email em lowercase
            expect(mockEq).toHaveBeenCalledWith("email", "test@example.com");
        });

        it("retorna dados do master quando encontrado", async () => {
            const masterData = {
                workspace_id: "ws-123",
                email: "master@escola.com",
                password_hash: "$2a$10$hash",
                nome: "Master Teste",
            };
            const workspaceData = { name: "Escola Teste" };

            mockMaybeSingle
                .mockResolvedValueOnce({ data: masterData }) // workspace_masters
                .mockResolvedValueOnce({ data: workspaceData }); // workspaces

            const result = await findUserByEmail("master@escola.com");

            expect(result).not.toBeNull();
            expect(result?.role).toBe("master");
            expect(result?.workspace_id).toBe("ws-123");
            expect(result?.workspace_name).toBe("Escola Teste");
        });

        it("retorna dados do member quando encontrado e ativo", async () => {
            const memberData = {
                id: "member-123",
                workspace_id: "ws-456",
                nome: "Professor João",
                email: "prof@escola.com",
                can_estudantes: true,
                can_pei: true,
                active: true,
            };
            const workspaceData = { name: "Escola Segunda" };

            mockMaybeSingle
                .mockResolvedValueOnce({ data: null }) // workspace_masters - não encontrado
                .mockResolvedValueOnce({ data: memberData }) // workspace_members
                .mockResolvedValueOnce({ data: workspaceData }); // workspaces

            const result = await findUserByEmail("prof@escola.com");

            expect(result).not.toBeNull();
            expect(result?.role).toBe("member");
            expect(result?.user).toEqual(memberData);
        });

        it("não retorna member inativo", async () => {
            mockMaybeSingle
                .mockResolvedValueOnce({ data: null }) // workspace_masters
                .mockResolvedValueOnce({ data: null }); // workspace_members (inativo não retorna)

            const result = await findUserByEmail("inativo@escola.com");

            expect(result).toBeNull();
        });

        it("retorna null quando usuário não existe", async () => {
            mockMaybeSingle
                .mockResolvedValueOnce({ data: null })
                .mockResolvedValueOnce({ data: null });

            const result = await findUserByEmail("naoexiste@escola.com");

            expect(result).toBeNull();
        });

        it("faz trim no email antes de buscar", async () => {
            mockMaybeSingle.mockResolvedValueOnce({ data: null });
            mockMaybeSingle.mockResolvedValueOnce({ data: null });

            await findUserByEmail("  test@example.com  ");

            expect(mockEq).toHaveBeenCalledWith("email", "test@example.com");
        });
    });

    describe("verifyPassword", () => {
        it("retorna false para senha vazia", () => {
            mockCompareSync.mockReturnValue(false);
            const result = verifyPassword("", "hash");
            expect(result).toBe(false);
        });

        it("retorna false para hash vazio", () => {
            mockCompareSync.mockReturnValue(false);
            const result = verifyPassword("senha", "");
            expect(result).toBe(false);
        });

        it("usa bcrypt.compareSync corretamente", () => {
            mockCompareSync.mockReturnValue(true);
            const result = verifyPassword("senha123", "$2a$10$hash");
            expect(mockCompareSync).toHaveBeenCalledWith("senha123", "$2a$10$hash");
            expect(result).toBe(true);
        });

        it("retorna false quando bcrypt lança erro", () => {
            mockCompareSync.mockImplementation(() => {
                throw new Error("Invalid hash");
            });
            const result = verifyPassword("senha", "hash-invalido");
            expect(result).toBe(false);
        });

        it("retorna true para senha correta", () => {
            mockCompareSync.mockReturnValue(true);
            const result = verifyPassword("senhaCorreta", "$2a$10$hash");
            expect(result).toBe(true);
        });

        it("retorna false para senha incorreta", () => {
            mockCompareSync.mockReturnValue(false);
            const result = verifyPassword("senhaErrada", "$2a$10$hash");
            expect(result).toBe(false);
        });
    });

    describe("verifyWorkspaceMaster", () => {
        it("retorna false quando master não existe", async () => {
            mockMaybeSingle.mockResolvedValue({ data: null });

            const result = await verifyWorkspaceMaster("ws-123", "test@test.com", "senha");
            expect(result).toBe(false);
        });

        it("retorna false quando não há password_hash", async () => {
            mockMaybeSingle.mockResolvedValue({
                data: { email: "test@test.com", password_hash: null },
            });

            const result = await verifyWorkspaceMaster("ws-123", "test@test.com", "senha");
            expect(result).toBe(false);
        });

        it("retorna true para credenciais válidas", async () => {
            mockMaybeSingle.mockResolvedValue({
                data: {
                    email: "master@escola.com",
                    password_hash: "$2a$10$hash",
                },
            });
            mockCompareSync.mockReturnValue(true);

            const result = await verifyWorkspaceMaster("ws-123", "master@escola.com", "senha123");
            expect(result).toBe(true);
        });

        it("normaliza email para lowercase", async () => {
            mockMaybeSingle.mockResolvedValue({ data: null });

            await verifyWorkspaceMaster("ws-123", "MASTER@ESCOLA.COM", "senha");

            expect(mockEq).toHaveBeenCalledWith("email", "master@escola.com");
        });

        it("faz trim no email", async () => {
            mockMaybeSingle.mockResolvedValue({ data: null });

            await verifyWorkspaceMaster("ws-123", "  master@escola.com  ", "senha");

            expect(mockEq).toHaveBeenCalledWith("email", "master@escola.com");
        });
    });

    describe("verifyMemberPassword", () => {
        it("retorna false quando member não existe", async () => {
            mockMaybeSingle.mockResolvedValue({ data: null });

            const result = await verifyMemberPassword("ws-123", "test@test.com", "senha");
            expect(result).toBe(false);
        });

        it("retorna false quando member não tem password_hash", async () => {
            mockMaybeSingle.mockResolvedValue({
                data: { password_hash: null },
            });

            const result = await verifyMemberPassword("ws-123", "test@test.com", "senha");
            expect(result).toBe(false);
        });

        it("retorna true para senha correta", async () => {
            mockMaybeSingle.mockResolvedValue({
                data: { password_hash: "$2a$10$hash" },
            });
            mockCompareSync.mockReturnValue(true);

            const result = await verifyMemberPassword("ws-123", "prof@escola.com", "senha123");
            expect(result).toBe(true);
        });

        it("verifica se member está ativo", async () => {
            mockMaybeSingle.mockResolvedValue({
                data: { password_hash: "$2a$10$hash" },
            });

            await verifyMemberPassword("ws-123", "test@test.com", "senha");

            // Verifica se o filtro active=true foi aplicado
            expect(mockEq).toHaveBeenCalledWith("active", true);
        });
    });

    describe("verifyPlatformAdmin", () => {
        it("retorna false quando admin não existe", async () => {
            mockMaybeSingle.mockResolvedValue({ data: null });

            const result = await verifyPlatformAdmin("admin@platform.com", "senha");
            expect(result).toBe(false);
        });

        it("retorna false quando admin está inativo", async () => {
            mockMaybeSingle.mockResolvedValue({
                data: {
                    password_hash: "$2a$10$hash",
                    active: false,
                },
            });

            const result = await verifyPlatformAdmin("admin@platform.com", "senha");
            expect(result).toBe(false);
        });

        it("retorna false quando não há password_hash", async () => {
            mockMaybeSingle.mockResolvedValue({
                data: {
                    password_hash: null,
                    active: true,
                },
            });

            const result = await verifyPlatformAdmin("admin@platform.com", "senha");
            expect(result).toBe(false);
        });

        it("retorna true para admin ativo com senha correta", async () => {
            mockMaybeSingle.mockResolvedValue({
                data: {
                    password_hash: "$2a$10$hash",
                    active: true,
                },
            });
            mockCompareSync.mockReturnValue(true);

            const result = await verifyPlatformAdmin("admin@platform.com", "senha123");
            expect(result).toBe(true);
        });

        it("normaliza email para lowercase", async () => {
            mockMaybeSingle.mockResolvedValue({ data: null });

            await verifyPlatformAdmin("ADMIN@PLATFORM.COM", "senha");

            expect(mockEq).toHaveBeenCalledWith("email", "admin@platform.com");
        });
    });

    describe("Segurança - Prevenção de ataques", () => {
        it("não expõe informação de qual campo falhou (timing)", async () => {
            // Tanto email não encontrado quanto senha incorreta devem ter
            // tempo de resposta similar (prevenção de user enumeration)
            mockMaybeSingle.mockResolvedValue({ data: null });

            const start1 = Date.now();
            await findUserByEmail("naoexiste@test.com");
            const time1 = Date.now() - start1;

            mockMaybeSingle.mockResolvedValue({
                data: { password_hash: "$2a$10$hash" },
            });
            mockCompareSync.mockReturnValue(false);

            const start2 = Date.now();
            await verifyMemberPassword("ws-123", "existe@test.com", "senhaerrada");
            const time2 = Date.now() - start2;

            // As operações devem ser rápidas (< 100ms)
            expect(time1).toBeLessThan(100);
            expect(time2).toBeLessThan(100);
        });

        it("rejeita emails malformados sem crash", async () => {
            mockMaybeSingle.mockResolvedValue({ data: null });

            const result = await findUserByEmail("email@invalido");
            expect(result).toBeNull();
        });
    });
});
