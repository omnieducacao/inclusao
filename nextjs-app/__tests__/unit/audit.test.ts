/**
 * Testes Unitários — Audit Log (lib/audit.ts), SCRUM-70
 *
 * Cobertura:
 * - grava ids (nunca nome ou e-mail) e o resumo do IP
 * - registra no log quando o Supabase recusa a gravação (antes o erro era engolido)
 * - limpa do metadata campos com dado pessoal ou conteúdo
 * - quem age durante uma simulação é a pessoa real, com a marca da simulação
 * - a demonstração não grava nada
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import type { SessionPayload } from "@/lib/session";

const mockInsert = vi.fn().mockResolvedValue({ data: null, error: null });
const mockFrom = vi.fn().mockReturnValue({ insert: mockInsert });
const mockLoggerError = vi.fn();

vi.mock("@/lib/supabase", () => ({
    getSupabase: () => ({ from: mockFrom }),
}));
vi.mock("@/lib/logger", () => ({
    logger: { error: (...a: unknown[]) => mockLoggerError(...a), warn: vi.fn(), info: vi.fn() },
}));

import { logAction, logExport, auditar, atorDaSessao, limparMetadata } from "@/lib/audit";

const ID_MEMBRO = "11111111-1111-4111-8111-111111111111";
const ID_ESCOLA = "22222222-2222-4222-8222-222222222222";
const ID_ADMIN = "33333333-3333-4333-8333-333333333333";

function sessao(extra: Partial<SessionPayload> = {}): SessionPayload {
    return {
        workspace_id: ID_ESCOLA,
        workspace_name: "Escola Demo",
        usuario_nome: "Beatriz Almeida",
        usuario_id: ID_MEMBRO,
        user_role: "member",
        member: { id: ID_MEMBRO },
        exp: 0,
        ...extra,
    };
}

function pedido(): Request {
    return new Request("http://localhost/api/x", {
        headers: {
            "x-forwarded-for": "200.1.2.3",
            "user-agent": "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/120.0 Mobile Safari/537.36",
        },
    });
}

describe("Audit Log — lib/audit.ts", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("logAction", () => {
        it("insere ids na tabela audit_log", async () => {
            await logAction({
                workspaceId: ID_ESCOLA,
                actorId: ID_MEMBRO,
                actorRole: "member",
                action: "view",
                resourceType: "pei",
                resourceId: "student-abc",
            });

            expect(mockFrom).toHaveBeenCalledWith("audit_log");
            expect(mockInsert).toHaveBeenCalledWith({
                workspace_id: ID_ESCOLA,
                actor_id: ID_MEMBRO,
                actor_role: "member",
                action: "view",
                resource_type: "pei",
                resource_id: "student-abc",
                metadata: {},
                ip_address: null,
            });
        });

        it("grava só o resumo do IP e o tipo de navegador, nunca o IP", async () => {
            await logAction({ action: "login", resourceType: "sessao", req: pedido() });
            const linha = mockInsert.mock.calls[0][0];
            expect(linha.ip_address).toMatch(/^ip:[0-9a-f]{32}$/);
            expect(JSON.stringify(linha)).not.toContain("200.1.2.3");
            expect(linha.metadata.navegador).toBe("Chrome · Android");
            expect(JSON.stringify(linha)).not.toContain("537.36");
        });

        it("trata campos opcionais como null", async () => {
            await logAction({ action: "login_failed", resourceType: "sessao" });
            expect(mockInsert).toHaveBeenCalledWith(
                expect.objectContaining({ workspace_id: null, actor_id: null, actor_role: null, resource_id: null })
            );
        });

        it("registra no log quando o Supabase recusa a gravação", async () => {
            mockInsert.mockResolvedValueOnce({ data: null, error: { code: "22P02", message: "invalid input" } });
            await expect(logAction({ action: "view", resourceType: "pei" })).resolves.toBeUndefined();
            expect(mockLoggerError).toHaveBeenCalledTimes(1);
            expect(mockLoggerError.mock.calls[0][0]).toMatchObject({ code: "22P02", action: "view" });
        });

        it("não derruba a ação principal se a conexão falhar", async () => {
            mockInsert.mockRejectedValueOnce(new Error("DB connection error"));
            await expect(logAction({ action: "view", resourceType: "pei" })).resolves.toBeUndefined();
            expect(mockLoggerError).toHaveBeenCalledTimes(1);
        });
    });

    describe("limparMetadata", () => {
        it("tira nome, e-mail, senha, conteúdo e textos longos", () => {
            expect(limparMetadata({
                nome: "Beatriz Almeida",
                email: "b@escola.br",
                student_name: "Beatriz",
                password: "x",
                conteudo: "…",
                observacao: "a".repeat(200),
                format: "pdf",
                versao: 3,
                can_gestao: true,
            })).toEqual({ format: "pdf", versao: 3, can_gestao: true });
        });
    });

    describe("atorDaSessao", () => {
        it("usa o id de quem entrou e o papel, nunca o nome", () => {
            const ator = atorDaSessao(sessao());
            expect(ator).toMatchObject({ workspaceId: ID_ESCOLA, actorId: ID_MEMBRO, actorRole: "member" });
            expect(JSON.stringify(ator)).not.toContain("Beatriz");
        });

        it("na simulação de membro, o ator é a coordenação e a simulação fica marcada", () => {
            const ator = atorDaSessao(sessao({ usuario_id: ID_ESCOLA, simulating_member_id: ID_MEMBRO }));
            expect(ator.actorId).toBe(ID_ESCOLA);
            expect(ator.metadata).toEqual({ simulando_membro: ID_MEMBRO });
        });

        it("na simulação de escola pelo admin, o papel é platform_admin", () => {
            const ator = atorDaSessao(sessao({
                usuario_id: ID_ADMIN, user_role: "master", is_platform_admin: true,
                simulating_workspace_id: ID_ESCOLA, member: { id: null },
            }));
            expect(ator).toMatchObject({ actorId: ID_ADMIN, actorRole: "platform_admin", metadata: { simulando_escola: true } });
        });

        it("sessão antiga sem usuario_id: usa o membro; em simulação, não chuta quem é", () => {
            expect(atorDaSessao(sessao({ usuario_id: undefined })).actorId).toBe(ID_MEMBRO);
            expect(atorDaSessao(sessao({ usuario_id: undefined, simulating_member_id: ID_MEMBRO })).actorId).toBeNull();
            expect(atorDaSessao(sessao({ usuario_id: undefined, user_role: "master", member: { id: null } })).actorId).toBe(ID_ESCOLA);
        });
    });

    describe("auditar", () => {
        it("grava em nome de quem está logado", async () => {
            await auditar(sessao(), pedido(), { action: "update", resourceType: "diario", resourceId: "student-abc" });
            expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
                workspace_id: ID_ESCOLA, actor_id: ID_MEMBRO, action: "update", resource_type: "diario", resource_id: "student-abc",
            }));
        });

        it("a demonstração não grava nada", async () => {
            await auditar(sessao({ is_demo: true }), pedido(), { action: "view", resourceType: "pei" });
            expect(mockInsert).not.toHaveBeenCalled();
        });

        it("sem sessão não grava", async () => {
            await auditar(null, undefined, { action: "view", resourceType: "pei" });
            expect(mockInsert).not.toHaveBeenCalled();
        });
    });

    describe("logExport", () => {
        it("registra a exportação com o formato (json por padrão)", async () => {
            await logExport(sessao(), undefined, { resourceType: "student", resourceId: "student-abc" });
            await logExport(sessao(), undefined, { resourceType: "pei", format: "pdf" });
            expect(mockInsert.mock.calls[0][0]).toMatchObject({ action: "export", metadata: { format: "json" } });
            expect(mockInsert.mock.calls[1][0]).toMatchObject({ action: "export", resource_type: "pei", metadata: { format: "pdf" } });
        });
    });
});
