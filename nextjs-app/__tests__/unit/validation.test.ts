import { describe, it, expect } from "vitest";
import {
    parseBody,
    createStudentSchema,
    updateStudentSchema,
    criarAtividadeSchema,
    planoAulaSchema,
    createMemberSchema,
    loginSchema,
    adminLoginSchema,
    adaptarAtividadeSchema,
    diagnosticoBarreirasSchema,
    assessmentSchema,
    hubRoteiroSchema,
    hubDinamicaSchema,
} from "@/lib/validation";

describe("validation schemas", () => {
    describe("createStudentSchema", () => {
        it("aceita dados válidos completos", () => {
            const data = {
                name: "João Silva",
                grade: "3º ano",
                class_group: "A",
                diagnosis: "TEA",
                privacy_consent: true,
            };
            const result = createStudentSchema.safeParse(data);
            expect(result.success).toBe(true);
        });

        it("aceita com campos opcionais ausentes (exceto privacy_consent)", () => {
            const data = { name: "Maria", privacy_consent: true };
            const result = createStudentSchema.safeParse(data);
            expect(result.success).toBe(true);
        });

        it("rejeita sem privacy_consent", () => {
            const data = { name: "Maria" };
            const result = createStudentSchema.safeParse(data);
            expect(result.success).toBe(false);
        });

        it("rejeita privacy_consent false", () => {
            const data = { name: "Maria", privacy_consent: false };
            const result = createStudentSchema.safeParse(data);
            expect(result.success).toBe(false);
        });

        it("rejeita nome vazio", () => {
            const data = { name: "" };
            const result = createStudentSchema.safeParse(data);
            expect(result.success).toBe(false);
        });

        it("rejeita sem campo name", () => {
            const data = { grade: "5º ano" };
            const result = createStudentSchema.safeParse(data);
            expect(result.success).toBe(false);
        });

        it("faz trim do nome", () => {
            const data = { name: "  Ana  ", privacy_consent: true };
            const result = createStudentSchema.safeParse(data);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.name).toBe("Ana");
            }
        });
    });

    describe("updateStudentSchema", () => {
        it("aceita atualização parcial", () => {
            const result = updateStudentSchema.safeParse({ name: "Novo Nome" });
            expect(result.success).toBe(true);
        });

        it("aceita objeto vazio", () => {
            const result = updateStudentSchema.safeParse({});
            expect(result.success).toBe(true);
        });

        it("aceita valores null para campos nullable", () => {
            const result = updateStudentSchema.safeParse({ grade: null, diagnosis: null });
            expect(result.success).toBe(true);
        });
    });

    describe("criarAtividadeSchema", () => {
        it("aceita dados mínimos com engine", () => {
            const data = { engine: "red" };
            const result = criarAtividadeSchema.safeParse(data);
            expect(result.success).toBe(true);
        });

        it("aplica defaults corretos", () => {
            const data = { engine: "blue" };
            const result = criarAtividadeSchema.safeParse(data);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.ei_mode).toBe(false);
                expect(result.data.habilidades).toEqual([]);
                expect(result.data.assunto).toBe("");
            }
        });

        it("rejeita engine inválido", () => {
            const data = { engine: "invalid_engine" };
            const result = criarAtividadeSchema.safeParse(data);
            expect(result.success).toBe(false);
        });

        it("aceita todas as engines válidas", () => {
            for (const engine of ["red", "blue", "green"]) {
                const result = criarAtividadeSchema.safeParse({ engine });
                expect(result.success).toBe(true);
            }
        });
    });

    describe("planoAulaSchema", () => {
        it("aceita dados com apenas engine", () => {
            const data = { engine: "red" };
            const result = planoAulaSchema.safeParse(data);
            expect(result.success).toBe(true);
        });

        it("aceita dados completos", () => {
            const data = {
                engine: "green",
                assunto: "Frações",
                serie: "5º ano",
                duracao: "50 minutos",
                duracao_minutos: 50,
                materia: "Matemática",
            };
            const result = planoAulaSchema.safeParse(data);
            expect(result.success).toBe(true);
        });

        it("aplica defaults de string vazia", () => {
            const data = { engine: "red" };
            const result = planoAulaSchema.safeParse(data);
            if (result.success) {
                expect(result.data.assunto).toBe("");
                expect(result.data.serie).toBe("");
                expect(result.data.duracao).toBe("");
            }
        });
    });

    describe("parseBody", () => {
        it("retorna erro quando JSON inválido", async () => {
            const req = new Request("http://x", { method: "POST", body: "não é json" });
            const result = await parseBody(req, loginSchema);
            expect(result.error).toBeDefined();
            expect(result.error!.status).toBe(400);
        });

        it("retorna dados quando schema válido", async () => {
            const req = new Request("http://x", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: "test@test.com", password: "1234" }),
            });
            const result = await parseBody(req, loginSchema);
            expect(result.error).toBeUndefined();
            expect(result.data).toEqual({ email: "test@test.com", password: "1234" });
        });

        it("retorna erro quando schema falha", async () => {
            const req = new Request("http://x", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: "invalido", password: "12" }),
            });
            const result = await parseBody(req, loginSchema);
            expect(result.error).toBeDefined();
            expect(result.error!.status).toBe(400);
        });
    });

    describe("loginSchema", () => {
        it("aceita email e senha válidos", () => {
            const r = loginSchema.safeParse({ email: "a@b.com", password: "1234" });
            expect(r.success).toBe(true);
            if (r.success) expect(r.data.email).toBe("a@b.com");
        });

        it("rejeita email inválido", () => {
            expect(loginSchema.safeParse({ email: "x", password: "1234" }).success).toBe(false);
        });

        it("rejeita senha com menos de 4 caracteres", () => {
            expect(loginSchema.safeParse({ email: "a@b.com", password: "123" }).success).toBe(false);
        });

        it("aplica lowercase no email", () => {
            const r = loginSchema.safeParse({ email: "TEST@X.COM", password: "1234" });
            expect(r.success).toBe(true);
            if (r.success) expect(r.data.email).toBe("test@x.com");
        });
    });

    describe("adminLoginSchema", () => {
        it("aceita credenciais válidas", () => {
            const r = adminLoginSchema.safeParse({ email: "admin@x.com", password: "senha123" });
            expect(r.success).toBe(true);
        });
    });

    describe("createMemberSchema", () => {
        it("aceita dados mínimos com defaults", () => {
            const r = createMemberSchema.safeParse({
                nome: "João",
                email: "joao@escola.com",
                password: "1234",
            });
            expect(r.success).toBe(true);
            if (r.success) {
                expect(r.data.can_estudantes).toBe(false);
                expect(r.data.can_gestao).toBe(false);
                expect(r.data.link_type).toBe("todos");
            }
        });

        it("aceita todas as permissões can_*", () => {
            const r = createMemberSchema.safeParse({
                nome: "Maria",
                email: "maria@escola.com",
                password: "1234",
                can_estudantes: true,
                can_pei: true,
                can_paee: true,
                can_hub: true,
                can_diario: true,
                can_avaliacao: true,
                can_gestao: true,
            });
            expect(r.success).toBe(true);
        });

        it("aceita link_type turma e tutor", () => {
            expect(createMemberSchema.safeParse({ nome: "A", email: "a@b.com", password: "1234", link_type: "turma" }).success).toBe(true);
            expect(createMemberSchema.safeParse({ nome: "A", email: "a@b.com", password: "1234", link_type: "tutor" }).success).toBe(true);
        });

        it("rejeita sem nome", () => {
            expect(createMemberSchema.safeParse({ email: "a@b.com", password: "1234" }).success).toBe(false);
        });
    });

    describe("adaptarAtividadeSchema", () => {
        it("exige texto não vazio", () => {
            expect(adaptarAtividadeSchema.safeParse({ texto: "", engine: "red" }).success).toBe(false);
        });

        it("aceita texto e engine", () => {
            const r = adaptarAtividadeSchema.safeParse({ texto: "Atividade X", engine: "blue" });
            expect(r.success).toBe(true);
        });
    });

    describe("diagnosticoBarreirasSchema", () => {
        it("exige observacoes e studentName", () => {
            expect(diagnosticoBarreirasSchema.safeParse({ observacoes: "Ok", studentName: "João" }).success).toBe(true);
            expect(diagnosticoBarreirasSchema.safeParse({ observacoes: "", studentName: "João" }).success).toBe(false);
        });
    });

    describe("assessmentSchema", () => {
        it("exige student_id", () => {
            expect(assessmentSchema.safeParse({ student_id: "est-1" }).success).toBe(true);
            expect(assessmentSchema.safeParse({}).success).toBe(false);
        });

        it("aceita rubric_data e observation opcionais", () => {
            const r = assessmentSchema.safeParse({
                student_id: "est-1",
                rubric_data: { h1: "3" },
                observation: "Bom progresso",
            });
            expect(r.success).toBe(true);
        });
    });

    describe("hubRoteiroSchema", () => {
        it("aplica defaults de materia e assunto", () => {
            const r = hubRoteiroSchema.safeParse({ engine: "red" });
            expect(r.success).toBe(true);
            if (r.success) {
                expect(r.data.materia).toBe("Geral");
                expect(r.data.assunto).toBe("");
            }
        });
    });

    describe("hubDinamicaSchema", () => {
        it("aplica default qtd_alunos 25", () => {
            const r = hubDinamicaSchema.safeParse({ engine: "green" });
            expect(r.success).toBe(true);
            if (r.success) expect(r.data.qtd_alunos).toBe(25);
        });
    });

    describe("criarAtividadeSchema - engines", () => {
        it("aceita engines yellow e orange", () => {
            expect(criarAtividadeSchema.safeParse({ engine: "yellow" }).success).toBe(true);
            expect(criarAtividadeSchema.safeParse({ engine: "orange" }).success).toBe(true);
        });
    });
});
