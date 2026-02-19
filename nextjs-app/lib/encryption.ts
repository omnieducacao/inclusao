/**
 * LGPD — Criptografia de campos sensíveis de saúde (Art. 11, LGPD).
 *
 * Usa AES-256-GCM (autenticado) para criptografar campos como
 * diagnóstico, medicamentos e orientações médicas antes de gravar
 * no banco de dados.
 *
 * Formato do campo criptografado:
 *   enc:<iv_base64>:<authTag_base64>:<ciphertext_base64>
 *
 * Se o campo não começa com "enc:", é tratado como texto plano
 * (backwards compatible com dados existentes).
 */

import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

// ─── Configuração ────────────────────────────────────────────────
const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 96 bits (recomendado para GCM)
const AUTH_TAG_LENGTH = 16; // 128 bits
const PREFIX = "enc:";

/** Campos sensíveis dentro de pei_data que devem ser criptografados. */
export const SENSITIVE_PEI_FIELDS = [
    "diagnostico",
    "lista_medicamentos",
    "historico",
    "orientacoes_especialistas",
    "orientacoes_por_profissional",
    "detalhes_diagnostico",
] as const;

/** Campos sensíveis dentro de paee_data que devem ser criptografados. */
export const SENSITIVE_PAEE_FIELDS = [
    "conteudo_diagnostico_barreiras",
    "input_original_diagnostico_barreiras",
] as const;

// ─── Key management ──────────────────────────────────────────────

function getKey(): Buffer {
    const hex = process.env.ENCRYPTION_KEY;
    if (!hex) {
        throw new Error(
            "ENCRYPTION_KEY não está definida. Adicione uma chave de 64 caracteres hex ao .env.local"
        );
    }
    if (hex.length !== 64) {
        throw new Error(
            `ENCRYPTION_KEY deve ter 64 caracteres hex (32 bytes). Atual: ${hex.length}`
        );
    }
    return Buffer.from(hex, "hex");
}

// ─── Core encrypt / decrypt ──────────────────────────────────────

/**
 * Criptografa um valor string.
 * Retorna: "enc:<iv>:<tag>:<ciphertext>" (tudo em base64).
 * Se o valor estiver vazio/nulo, retorna inalterado.
 */
export function encryptField(plaintext: string): string {
    if (!plaintext || plaintext.trim().length === 0) return plaintext;
    if (plaintext.startsWith(PREFIX)) return plaintext; // já criptografado

    const key = getKey();
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, key, iv, {
        authTagLength: AUTH_TAG_LENGTH,
    });

    let encrypted = cipher.update(plaintext, "utf8", "base64");
    encrypted += cipher.final("base64");
    const authTag = cipher.getAuthTag();

    return `${PREFIX}${iv.toString("base64")}:${authTag.toString("base64")}:${encrypted}`;
}

/**
 * Descriptografa um valor previamente criptografado.
 * Se o valor não começa com "enc:", retorna inalterado (texto plano).
 */
export function decryptField(encrypted: string): string {
    if (!encrypted || !encrypted.startsWith(PREFIX)) return encrypted;

    try {
        const withoutPrefix = encrypted.slice(PREFIX.length);
        const parts = withoutPrefix.split(":");
        if (parts.length !== 3) {
            console.warn("[encryption] Formato inválido, retornando vazio");
            return "";
        }

        const [ivB64, tagB64, ciphertextB64] = parts;
        const key = getKey();
        const iv = Buffer.from(ivB64, "base64");
        const authTag = Buffer.from(tagB64, "base64");

        const decipher = createDecipheriv(ALGORITHM, key, iv, {
            authTagLength: AUTH_TAG_LENGTH,
        });
        decipher.setAuthTag(authTag);

        let decrypted = decipher.update(ciphertextB64, "base64", "utf8");
        decrypted += decipher.final("utf8");
        return decrypted;
    } catch (err) {
        console.error("[encryption] Erro ao descriptografar:", err);
        return ""; // Falha silenciosa — evita expor dados corrompidos
    }
}

// ─── Helpers para objetos JSON ───────────────────────────────────

/**
 * Criptografa um valor que pode ser string, array ou objeto.
 * Objetos e arrays são serializados como JSON antes da criptografia.
 */
function encryptValue(value: unknown): unknown {
    if (value === null || value === undefined) return value;
    if (typeof value === "string") return encryptField(value);
    // Arrays e objetos: serializa como JSON e criptografa a string
    if (typeof value === "object") {
        const json = JSON.stringify(value);
        return encryptField(json);
    }
    return value; // booleans, numbers, etc — não criptografa
}

/**
 * Descriptografa um valor que pode ser string criptografada
 * (representando string pura ou JSON serializado).
 */
function decryptValue(value: unknown, fieldName: string): unknown {
    if (value === null || value === undefined) return value;
    if (typeof value !== "string") return value; // já é objeto/array
    if (!value.startsWith(PREFIX)) return value; // texto plano

    const decrypted = decryptField(value);

    // Campos que são objeto/array: tentar parsear JSON
    const jsonFields = [
        "lista_medicamentos",
        "orientacoes_por_profissional",
        "detalhes_diagnostico",
        "input_original_diagnostico_barreiras",
    ];

    if (jsonFields.includes(fieldName)) {
        try {
            return JSON.parse(decrypted);
        } catch {
            return decrypted; // se não for JSON, retorna como string
        }
    }

    return decrypted;
}

// ─── Public API para dados estruturados ──────────────────────────

/**
 * Criptografa campos sensíveis de um objeto pei_data.
 * Retorna uma cópia do objeto com os campos criptografados.
 */
export function encryptSensitivePeiFields(
    data: Record<string, unknown>
): Record<string, unknown> {
    if (!data || typeof data !== "object") return data;

    const result = { ...data };
    for (const field of SENSITIVE_PEI_FIELDS) {
        if (result[field] !== undefined && result[field] !== null) {
            result[field] = encryptValue(result[field]);
        }
    }
    return result;
}

/**
 * Descriptografa campos sensíveis de um objeto pei_data.
 * Retorna uma cópia do objeto com os campos descriptografados.
 */
export function decryptSensitivePeiFields(
    data: Record<string, unknown>
): Record<string, unknown> {
    if (!data || typeof data !== "object") return data;

    const result = { ...data };
    for (const field of SENSITIVE_PEI_FIELDS) {
        if (result[field] !== undefined && result[field] !== null) {
            result[field] = decryptValue(result[field], field);
        }
    }
    return result;
}

/**
 * Criptografa campos sensíveis de um objeto paee_data.
 */
export function encryptSensitivePaeeFields(
    data: Record<string, unknown>
): Record<string, unknown> {
    if (!data || typeof data !== "object") return data;

    const result = { ...data };
    for (const field of SENSITIVE_PAEE_FIELDS) {
        if (result[field] !== undefined && result[field] !== null) {
            result[field] = encryptValue(result[field]);
        }
    }
    return result;
}

/**
 * Descriptografa campos sensíveis de um objeto paee_data.
 */
export function decryptSensitivePaeeFields(
    data: Record<string, unknown>
): Record<string, unknown> {
    if (!data || typeof data !== "object") return data;

    const result = { ...data };
    for (const field of SENSITIVE_PAEE_FIELDS) {
        if (result[field] !== undefined && result[field] !== null) {
            result[field] = decryptValue(result[field], field);
        }
    }
    return result;
}

/**
 * Gera uma chave AES-256 aleatória como string hex (64 chars).
 * Útil para gerar ENCRYPTION_KEY.
 */
export function generateEncryptionKey(): string {
    return randomBytes(32).toString("hex");
}
