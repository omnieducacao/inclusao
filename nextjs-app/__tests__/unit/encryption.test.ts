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
            (process.env as Record<string, unknown>).ENCRYPTION_KEY = ORIGINAL_KEY;  
        } else {
            delete (process.env as Record<string, unknown>).ENCRYPTION_KEY;  
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
            expect(encrypted.serie).toBe("3º Ano (EFAI)");
            // SCRUM-231: a cópia do nome dentro do PEI passou a ser cifrada
            expect((encrypted.nome as string).startsWith("enc:")).toBe(true);
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

// SCRUM-66: rotação da ENCRYPTION_KEY sem parada (chave anterior só para leitura)
describe("Rotação de chave — ENCRYPTION_KEY_ANTERIOR", () => {
    const CHAVE_A = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
    const CHAVE_B = "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
    const ORIGINAL_ANTERIOR = process.env.ENCRYPTION_KEY_ANTERIOR;

    afterEach(() => {
        if (ORIGINAL_ANTERIOR === undefined) delete process.env.ENCRYPTION_KEY_ANTERIOR;
        else process.env.ENCRYPTION_KEY_ANTERIOR = ORIGINAL_ANTERIOR;
        if (ORIGINAL_KEY === undefined) delete process.env.ENCRYPTION_KEY;
        else process.env.ENCRYPTION_KEY = ORIGINAL_KEY;
        vi.resetModules();
    });

    async function cifrarCom(chave: string, texto: string): Promise<string> {
        process.env.ENCRYPTION_KEY = chave;
        delete process.env.ENCRYPTION_KEY_ANTERIOR;
        vi.resetModules();
        const { encryptField } = await import("@/lib/encryption");
        return encryptField(texto);
    }

    async function abrirCom(atual: string, anterior: string | undefined, valor: string): Promise<string> {
        process.env.ENCRYPTION_KEY = atual;
        if (anterior === undefined) delete process.env.ENCRYPTION_KEY_ANTERIOR;
        else process.env.ENCRYPTION_KEY_ANTERIOR = anterior;
        vi.resetModules();
        const { decryptField } = await import("@/lib/encryption");
        return decryptField(valor);
    }

    it("com a chave nova e a anterior, abre o que foi cifrado com qualquer das duas", async () => {
        const velho = await cifrarCom(CHAVE_A, "diagnóstico antigo");
        const novo = await cifrarCom(CHAVE_B, "diagnóstico novo");
        expect(await abrirCom(CHAVE_B, CHAVE_A, velho)).toBe("diagnóstico antigo");
        expect(await abrirCom(CHAVE_B, CHAVE_A, novo)).toBe("diagnóstico novo");
    });

    it("sem a chave anterior, o dado da chave antiga não abre (devolve vazio)", async () => {
        const velho = await cifrarCom(CHAVE_A, "diagnóstico antigo");
        expect(await abrirCom(CHAVE_B, undefined, velho)).toBe("");
    });

    it("a gravação usa sempre a chave atual, nunca a anterior", async () => {
        process.env.ENCRYPTION_KEY = CHAVE_B;
        process.env.ENCRYPTION_KEY_ANTERIOR = CHAVE_A;
        vi.resetModules();
        const { encryptField } = await import("@/lib/encryption");
        const gravado = encryptField("dado novo");
        // só a chave B abre; a A (sozinha) não
        expect(await abrirCom(CHAVE_B, undefined, gravado)).toBe("dado novo");
        expect(await abrirCom(CHAVE_A, undefined, gravado)).toBe("");
    });

    it("ENCRYPTION_KEY_ANTERIOR inválida é ignorada, sem derrubar a leitura normal", async () => {
        const novo = await cifrarCom(CHAVE_B, "dado");
        expect(await abrirCom(CHAVE_B, "curta", novo)).toBe("dado");
    });
});

// SCRUM-231: dados pessoais do PEI e histórico de versões
describe("PEI: nome, nascimento, acompanhante e versões", () => {
    const CHAVE = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
    beforeEach(() => {
        process.env.ENCRYPTION_KEY = CHAVE;
        vi.resetModules();
    });

    it("cifra nome, nasc e acompanhante_nome e devolve iguais", async () => {
        const { encryptSensitivePeiFields, decryptSensitivePeiFields } = await import("@/lib/encryption");
        const pei = { nome: "Beatriz Almeida", nasc: "2016-03-12", acompanhante_nome: "Carla Souza", serie: "5º ano" };
        const c = encryptSensitivePeiFields(pei);
        for (const k of ["nome", "nasc", "acompanhante_nome"]) expect(String(c[k]).startsWith("enc:")).toBe(true);
        expect(c.serie).toBe("5º ano");
        expect(decryptSensitivePeiFields(c)).toEqual(pei);
    });

    it("cifra também as cópias do histórico de versões e as devolve iguais", async () => {
        const { encryptSensitivePeiFields, decryptSensitivePeiFields } = await import("@/lib/encryption");
        const pei = {
            nome: "Beatriz Almeida",
            diagnostico: "TEA",
            _versions: [
                { version: 1, label: "Versão 1", snapshot: { nome: "Beatriz Almeida", diagnostico: "TEA antigo", serie: "4º ano" } },
                { version: 2, label: "sem cópia" },
            ],
        };
        const c = encryptSensitivePeiFields(pei);
        const v = c._versions as Array<{ snapshot?: Record<string, unknown>; label: string }>;
        expect(String(v[0].snapshot!.nome).startsWith("enc:")).toBe(true);
        expect(String(v[0].snapshot!.diagnostico).startsWith("enc:")).toBe(true);
        expect(v[0].snapshot!.serie).toBe("4º ano");
        expect(v[0].label).toBe("Versão 1");
        expect(v[1]).toEqual({ version: 2, label: "sem cópia" });
        expect(decryptSensitivePeiFields(c)).toEqual(pei);
    });

    it("cifrar de novo o que já está cifrado não muda nada (seguro repetir)", async () => {
        const { encryptSensitivePeiFields } = await import("@/lib/encryption");
        const uma = encryptSensitivePeiFields({ nome: "Ana", _versions: [{ snapshot: { nome: "Ana" } }] });
        expect(encryptSensitivePeiFields(uma)).toEqual(uma);
    });
});
