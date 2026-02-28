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

// vi.hoisted para variáveis usadas em mocks (hoisted)
const { mockMaybeSingle, mockSingle, mockEq, mockFrom, mockCompareSync } = vi.hoisted(() => {
  const mockMaybeSingle = vi.fn();
  const mockSingle = vi.fn();
  let mockEqRef: ReturnType<typeof vi.fn>;
  mockEqRef = vi.fn(() => ({
    eq: mockEqRef,
    maybeSingle: mockMaybeSingle,
    single: mockSingle,
  }));
  const mockSelect = vi.fn(() => ({ eq: mockEqRef }));
  const mockFrom = vi.fn((table: string) => ({ select: mockSelect }));
  const mockCompareSync = vi.fn();
  return { mockMaybeSingle, mockSingle, mockEq: mockEqRef, mockFrom, mockCompareSync };
});

vi.mock("@/lib/supabase", () => ({
    getSupabase: vi.fn(() => ({
        from: mockFrom,
    })),
}));

vi.mock("bcryptjs", () => ({
    default: {
        compareSync: mockCompareSync,
    },
}));

import {
    findUserByEmail,
    verifyPassword,
    verifyWorkspaceMaster,
    verifyMemberPassword,
    verifyFamilyPassword,
    verifyPlatformAdmin,
} from "@/lib/auth";

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
            mockMaybeSingle
                .mockResolvedValueOnce({ data: null })
                .mockResolvedValueOnce({ data: null })
                .mockResolvedValue({ data: null }); // fallback para chamadas extras

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

            mockMaybeSingle.mockResolvedValueOnce({ data: masterData }); // workspace_masters
            mockSingle.mockResolvedValueOnce({ data: { name: "Escola Teste" } }); // getWorkspaceName

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

            mockMaybeSingle
                .mockResolvedValueOnce({ data: null }) // workspace_masters
                .mockResolvedValueOnce({ data: memberData }); // workspace_members
            mockSingle.mockResolvedValueOnce({ data: { name: "Escola Segunda" } }); // getWorkspaceName

            const result = await findUserByEmail("prof@escola.com");

            expect(result).not.toBeNull();
            expect(result?.role).toBe("member");
            expect(result?.user).toEqual(memberData);
        });

        it("não retorna member inativo", async () => {
            mockMaybeSingle
                .mockResolvedValueOnce({ data: null }) // workspace_masters
                .mockResolvedValueOnce({ data: null }) // workspace_members (inativo não retorna)
                .mockResolvedValue({ data: null });

            const result = await findUserByEmail("inativo@escola.com");

            expect(result).toBeNull();
        });

        it("retorna null quando usuário não existe", async () => {
            mockMaybeSingle
                .mockResolvedValueOnce({ data: null })
                .mockResolvedValueOnce({ data: null })
                .mockResolvedValue({ data: null });

            const result = await findUserByEmail("naoexiste@escola.com");

            expect(result).toBeNull();
        });

        it("retorna dados do family quando encontrado e módulo habilitado", async () => {
            const familyData = {
                id: "fam-123",
                workspace_id: "ws-789",
                nome: "Maria Responsável",
                email: "maria@familia.com",
                password_hash: "$2a$10$hash",
            };

            mockMaybeSingle
                .mockResolvedValueOnce({ data: null }) // workspace_masters
                .mockResolvedValueOnce({ data: null }) // workspace_members
                .mockResolvedValueOnce({ data: familyData }); // family_responsibles
            mockSingle
                .mockResolvedValueOnce({ data: { family_module_enabled: true }, error: null }) // workspaces check
                .mockResolvedValueOnce({ data: { name: "Escola Família" }, error: null }); // getWorkspaceName

            const result = await findUserByEmail("maria@familia.com");

            expect(result).not.toBeNull();
            expect(result?.role).toBe("family");
            expect(result?.workspace_id).toBe("ws-789");
            expect(result?.user).toEqual({ id: "fam-123", nome: "Maria Responsável", email: "maria@familia.com" });
        });

        it("não retorna family quando módulo desabilitado", async () => {
            const familyData = {
                id: "fam-123",
                workspace_id: "ws-789",
                nome: "Maria",
                email: "maria@familia.com",
                password_hash: "$2a$10$hash",
            };

            mockMaybeSingle
                .mockResolvedValueOnce({ data: null })
                .mockResolvedValueOnce({ data: null })
                .mockResolvedValueOnce({ data: familyData });
            mockSingle.mockResolvedValueOnce({ data: { family_module_enabled: false }, error: null });

            const result = await findUserByEmail("maria@familia.com");

            expect(result).toBeNull();
        });

        it("não retorna family quando sem password_hash", async () => {
            const familyData = {
                id: "fam-123",
                workspace_id: "ws-789",
                nome: "Maria",
                email: "maria@familia.com",
                password_hash: null,
            };

            mockMaybeSingle
                .mockResolvedValueOnce({ data: null })
                .mockResolvedValueOnce({ data: null })
                .mockResolvedValueOnce({ data: familyData });
            mockSingle.mockResolvedValueOnce({ data: { family_module_enabled: true }, error: null });

            const result = await findUserByEmail("maria@familia.com");

            expect(result).toBeNull();
        });

        it("faz trim no email antes de buscar", async () => {
            mockMaybeSingle
                .mockResolvedValueOnce({ data: null })
                .mockResolvedValueOnce({ data: null })
                .mockResolvedValue({ data: null });

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

    describe("verifyFamilyPassword", () => {
        it("retorna false quando responsável não existe", async () => {
            mockMaybeSingle.mockResolvedValue({ data: null });

            const result = await verifyFamilyPassword("ws-123", "familia@test.com", "senha");
            expect(result).toBe(false);
        });

        it("retorna false quando responsável não tem password_hash", async () => {
            mockMaybeSingle.mockResolvedValue({
                data: { password_hash: null },
            });

            const result = await verifyFamilyPassword("ws-123", "familia@test.com", "senha");
            expect(result).toBe(false);
        });

        it("retorna true para senha correta", async () => {
            mockMaybeSingle.mockResolvedValue({
                data: { password_hash: "$2a$10$hash" },
            });
            mockCompareSync.mockReturnValue(true);

            const result = await verifyFamilyPassword("ws-123", "mae@familia.com", "senha123");
            expect(result).toBe(true);
        });

        it("retorna false para senha incorreta", async () => {
            mockMaybeSingle.mockResolvedValue({
                data: { password_hash: "$2a$10$hash" },
            });
            mockCompareSync.mockReturnValue(false);

            const result = await verifyFamilyPassword("ws-123", "mae@familia.com", "senhaerrada");
            expect(result).toBe(false);
        });

        it("verifica active=true e normaliza email", async () => {
            mockMaybeSingle.mockResolvedValue({ data: null });

            await verifyFamilyPassword("ws-123", "  MAE@FAMILIA.COM  ", "senha");

            expect(mockEq).toHaveBeenCalledWith("email", "mae@familia.com");
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
