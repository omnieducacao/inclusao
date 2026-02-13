import { describe, it, expect } from "vitest";
import {
    createStudentSchema,
    updateStudentSchema,
    criarAtividadeSchema,
    planoAulaSchema,
} from "@/lib/validation";

describe("validation schemas", () => {
    describe("createStudentSchema", () => {
        it("aceita dados válidos completos", () => {
            const data = {
                name: "João Silva",
                grade: "3º ano",
                class_group: "A",
                diagnosis: "TEA",
            };
            const result = createStudentSchema.safeParse(data);
            expect(result.success).toBe(true);
        });

        it("aceita com campos opcionais ausentes", () => {
            const data = { name: "Maria" };
            const result = createStudentSchema.safeParse(data);
            expect(result.success).toBe(true);
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
            const data = { name: "  Ana  " };
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
});
