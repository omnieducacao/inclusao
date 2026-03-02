/**
 * Testes Unitários — Criptografia LGPD (lib/encryption.ts)
 *
 * Cobertura:
 * - Encrypt/decrypt roundtrip para strings simples
 * - Compatibilidade retroativa com texto plano
 * - Criptografia de campos sensíveis PEI (objeto completo)
 * - Criptografia de campos sensíveis PAEE
 * - Campos nulos/undefined permanecem inalterados
 * - Campos não-sensíveis permanecem inalterados
 * - Listas de medicamentos (array → JSON → encrypt)
 * - Caracteres especiais e acentos (UTF-8)
 * - Erro tratado para dados corrompidos
 * - Erro quando ENCRYPTION_KEY ausente
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Salvar o env original
const ORIGINAL_KEY = process.env.ENCRYPTION_KEY;

// Chave de teste (32 bytes = 64 hex chars)
const TEST_KEY = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

describe("Criptografia LGPD — lib/encryption.ts", () => {
    beforeEach(() => {
        process.env.ENCRYPTION_KEY = TEST_KEY;
        // Limpa cache do módulo para pegar o novo env
        vi.resetModules();
    });

    afterEach(() => {
        if (ORIGINAL_KEY) {
            (process.env as Record<string, unknown>).ENCRYPTION_KEY = ORIGINAL_KEY; // eslint-disable-line @typescript-eslint/no-explicit-any
        } else {
            delete (process.env as Record<string, unknown>).ENCRYPTION_KEY; // eslint-disable-line @typescript-eslint/no-explicit-any
        }
    });

    describe("encryptField / decryptField", () => {
        it("encrypt e decrypt roundtrip retorna valor original", async () => {
            const { encryptField, decryptField } = await import("@/lib/encryption");
            const original = "Transtorno do Espectro Autista (TEA)";
            const encrypted = encryptField(original);

            expect(encrypted).not.toBe(original);
            expect(encrypted.startsWith("enc:")).toBe(true);

            const decrypted = decryptField(encrypted);
            expect(decrypted).toBe(original);
        });

        it("texto plano sem prefixo enc: retorna inalterado (backwards compatible)", async () => {
            const { decryptField } = await import("@/lib/encryption");
            const plaintext = "TEA";
            expect(decryptField(plaintext)).toBe("TEA");
        });

        it("string vazia retorna inalterada", async () => {
            const { encryptField, decryptField } = await import("@/lib/encryption");
            expect(encryptField("")).toBe("");
            expect(decryptField("")).toBe("");
        });

        it("valor já criptografado não é criptografado novamente", async () => {
            const { encryptField } = await import("@/lib/encryption");
            const first = encryptField("TEA");
            const second = encryptField(first);
            expect(second).toBe(first); // não criptografa novamente
        });

        it("suporta caracteres especiais e acentos (UTF-8)", async () => {
            const { encryptField, decryptField } = await import("@/lib/encryption");
            const original = "Diagnóstico: Déficit de Atenção — TDAH (CID-10: F90.0) – Grau leve/moderado";
            const encrypted = encryptField(original);
            const decrypted = decryptField(encrypted);
            expect(decrypted).toBe(original);
        });

        it("suporta textos longos (laudos)", async () => {
            const { encryptField, decryptField } = await import("@/lib/encryption");
            const laudo = "A".repeat(10000); // 10KB de texto
            const encrypted = encryptField(laudo);
            const decrypted = decryptField(encrypted);
            expect(decrypted).toBe(laudo);
        });

        it("dados corrompidos retornam string vazia (falha segura)", async () => {
            const { decryptField } = await import("@/lib/encryption");
            const corrupted = "enc:AAAA:BBBB:CCCC";
            const result = decryptField(corrupted);
            expect(result).toBe("");
        });

        it("cada criptografia gera resultado diferente (IV aleatório)", async () => {
            const { encryptField } = await import("@/lib/encryption");
            const a = encryptField("TEA");
            const b = encryptField("TEA");
            expect(a).not.toBe(b); // IVs diferentes
        });
    });

    describe("encryptSensitivePeiFields / decryptSensitivePeiFields", () => {
        it("criptografa apenas campos sensíveis do PEI", async () => {
            const { encryptSensitivePeiFields } = await import("@/lib/encryption");

            const peiData = {
                nome: "João Silva",
                serie: "3º Ano (EFAI)",
                diagnostico: "TEA - Nível 1",
                historico: "Acompanhamento desde 2022",
                potencias: ["Memória Visual"],
                barreiras_selecionadas: { "Cognitivo": ["Atenção"] },
            };

            const encrypted = encryptSensitivePeiFields(peiData);

            // Campos não-sensíveis permanecem inalterados
            expect(encrypted.nome).toBe("João Silva");
            expect(encrypted.serie).toBe("3º Ano (EFAI)");
            expect(encrypted.potencias).toEqual(["Memória Visual"]);

            // Campos sensíveis foram criptografados
            expect((encrypted.diagnostico as string).startsWith("enc:")).toBe(true);
            expect((encrypted.historico as string).startsWith("enc:")).toBe(true);
        });

        it("decrypt restaura campos sensíveis do PEI", async () => {
            const { encryptSensitivePeiFields, decryptSensitivePeiFields } = await import("@/lib/encryption");

            const original = {
                diagnostico: "TEA - Nível 1",
                historico: "Acompanhamento desde 2022",
                orientacoes_especialistas: "Reduzir estímulos sensoriais",
                nome: "João",
            };

            const encrypted = encryptSensitivePeiFields(original);
            const decrypted = decryptSensitivePeiFields(encrypted);

            expect(decrypted.diagnostico).toBe("TEA - Nível 1");
            expect(decrypted.historico).toBe("Acompanhamento desde 2022");
            expect(decrypted.orientacoes_especialistas).toBe("Reduzir estímulos sensoriais");
            expect(decrypted.nome).toBe("João");
        });

        it("lista_medicamentos (array) encrypt/decrypt roundtrip", async () => {
            const { encryptSensitivePeiFields, decryptSensitivePeiFields } = await import("@/lib/encryption");

            const original = {
                lista_medicamentos: [
                    { nome: "Ritalina", posologia: "10mg 2x/dia", escola: true },
                    { nome: "Risperidona", posologia: "0.5mg noite" },
                ],
            };

            const encrypted = encryptSensitivePeiFields(original);
            // Array é serializado como JSON e criptografado como string
            expect(typeof encrypted.lista_medicamentos).toBe("string");
            expect((encrypted.lista_medicamentos as string).startsWith("enc:")).toBe(true);

            const decrypted = decryptSensitivePeiFields(encrypted);
            expect(decrypted.lista_medicamentos).toEqual(original.lista_medicamentos);
        });

        it("campos nulos/undefined permanecem inalterados", async () => {
            const { encryptSensitivePeiFields } = await import("@/lib/encryption");

            const peiData = { diagnostico: null, historico: undefined, nome: "Test" };
            const encrypted = encryptSensitivePeiFields(peiData as unknown as Record<string, unknown>);

            expect(encrypted.diagnostico).toBeNull();
            expect(encrypted.historico).toBeUndefined();
        });

        it("dados mistos (plano + criptografados) descriptografam corretamente", async () => {
            const { encryptField, decryptSensitivePeiFields } = await import("@/lib/encryption");

            const mixed = {
                diagnostico: "TEA", // texto plano (legado)
                historico: encryptField("Histórico criptografado"), // já criptografado
                nome: "João",
            };

            const decrypted = decryptSensitivePeiFields(mixed);
            expect(decrypted.diagnostico).toBe("TEA");
            expect(decrypted.historico).toBe("Histórico criptografado");
        });
    });

    describe("encryptSensitivePaeeFields / decryptSensitivePaeeFields", () => {
        it("criptografa campos sensíveis do PAEE", async () => {
            const { encryptSensitivePaeeFields, decryptSensitivePaeeFields } = await import("@/lib/encryption");

            const paeeData = {
                conteudo_diagnostico_barreiras: "Barreiras comunicacionais identificadas",
                status_diagnostico_barreiras: "aprovado",
            };

            const encrypted = encryptSensitivePaeeFields(paeeData);
            expect((encrypted.conteudo_diagnostico_barreiras as string).startsWith("enc:")).toBe(true);
            expect(encrypted.status_diagnostico_barreiras).toBe("aprovado"); // não-sensível

            const decrypted = decryptSensitivePaeeFields(encrypted);
            expect(decrypted.conteudo_diagnostico_barreiras).toBe("Barreiras comunicacionais identificadas");
        });
    });

    describe("generateEncryptionKey", () => {
        it("gera chave de 64 caracteres hex", async () => {
            const { generateEncryptionKey } = await import("@/lib/encryption");
            const key = generateEncryptionKey();
            expect(key).toHaveLength(64);
            expect(/^[0-9a-f]{64}$/.test(key)).toBe(true);
        });
    });

    describe("Tratamento de erros", () => {
        it("lança erro quando ENCRYPTION_KEY está ausente", async () => {
            delete process.env.ENCRYPTION_KEY;
            vi.resetModules();
            const { encryptField } = await import("@/lib/encryption");
            expect(() => encryptField("test")).toThrow("ENCRYPTION_KEY");
        });

        it("lança erro quando ENCRYPTION_KEY tem tamanho errado", async () => {
            process.env.ENCRYPTION_KEY = "tooshort";
            vi.resetModules();
            const { encryptField } = await import("@/lib/encryption");
            expect(() => encryptField("test")).toThrow("64 caracteres hex");
        });
    });
});
