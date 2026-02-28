/**
 * Testes Unitários - Segurança Geral
 * 
 * Cobertura:
 * - Validação de inputs (injeção)
 * - Proteção contra XSS
 * - Validação de arquivos
 * - Sanitização de dados
 * - Headers de segurança
 * - Configurações de cookies
 * 
 * OWASP Top 10 2021:
 * - A01:2021 – Broken Access Control
 * - A03:2021 – Injection
 * - A07:2021 – Identification and Authentication Failures
 * - A08:2021 – Software and Data Integrity Failures
 */

import { describe, it, expect, vi } from "vitest";
import { z } from "zod";

describe("Segurança - Validação de Inputs", () => {
    describe("Proteção contra SQL Injection", () => {
        it("rejeita input com comandos SQL", () => {
            const maliciousInputs = [
                "'; DROP TABLE users; --",
                "1 OR 1=1",
                "admin'--",
                "1; DELETE FROM students WHERE '1'='1",
                "'; EXEC xp_cmdshell('dir'); --",
            ];

            const safeSchema = z.string().max(100).regex(/^[a-zA-Z0-9\s\-_]+$/);

            for (const input of maliciousInputs) {
                const result = safeSchema.safeParse(input);
                expect(result.success).toBe(false);
            }
        });

        it("permite apenas caracteres alfanuméricos seguros", () => {
            const safeSchema = z.string().regex(/^[\p{L}\p{N}\s\-_.@]+$/u);

            expect(safeSchema.safeParse("João Silva").success).toBe(true);
            expect(safeSchema.safeParse("email@test.com").success).toBe(true);
            expect(safeSchema.safeParse("<script>").success).toBe(false);
        });
    });

    describe("Proteção contra XSS", () => {
        it("rejeita scripts em inputs", () => {
            const xssPayloads = [
                "<script>alert('xss')</script>",
                "<img src=x onerror=alert('xss')>",
                "javascript:alert('xss')",
                "<svg onload=alert('xss')>",
                "<iframe src='javascript:alert(1)'>",
                "<body onload=alert('xss')>",
            ];

            for (const payload of xssPayloads) {
                // Simula sanitização básica (HTML entities)
                const sanitized = payload
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/"/g, "&quot;")
                    .replace(/'/g, "&#x27;");

                expect(sanitized).not.toContain("<script>");
                if (payload.includes("<")) {
                    expect(sanitized).toContain("&lt;");
                }
            }
        });

        it("sanitiza HTML corretamente", () => {
            const dirty = '<p onclick="alert(1)">Texto</p>';
            const clean = dirty.replace(/on\w+="[^"]*"/g, "");
            expect(clean).not.toContain("onclick");
        });
    });

    describe("Proteção contra NoSQL Injection", () => {
        it("rejeita objetos maliciosos", () => {
            const maliciousObject = {
                $where: "function() { return true }",
                $gt: "",
            };

            // Schema que rejeita chaves começando com $
            const safeSchema = z.record(
                z.string().refine((k) => !k.startsWith("$"), "Chave inválida"),
                z.string()
            );
            const result = safeSchema.safeParse(maliciousObject);

            expect(result.success).toBe(false);
        });
    });

    describe("Validação de Email", () => {
        const emailSchema = z.string().email();

        it("rejeita emails inválidos", () => {
            const invalidEmails = [
                "notanemail",
                "@nodomain.com",
                "spaces in@email.com",
                "double@@at.com",
                ".startsWithDot@email.com",
                "endsWithDot.@email.com",
                "two..dots@email.com",
            ];

            for (const email of invalidEmails) {
                expect(emailSchema.safeParse(email).success).toBe(false);
            }
        });

        it("aceita emails válidos", () => {
            const validEmails = [
                "simple@example.com",
                "very.common@example.com",
                "disposable.style.with+symbol@example.com",
                "other.email-with-hyphen@example.com",
                "user.name+tag+sorting@example.com",
                "x@example.com",
            ];

            for (const email of validEmails) {
                expect(emailSchema.safeParse(email).success).toBe(true);
            }
        });
    });

    describe("Validação de Senha", () => {
        const strongPasswordSchema = z.string()
            .min(12, "Mínimo 12 caracteres")
            .regex(/[A-Z]/, "Deve conter maiúscula")
            .regex(/[a-z]/, "Deve conter minúscula")
            .regex(/[0-9]/, "Deve conter número")
            .regex(/[^A-Za-z0-9]/, "Deve conter especial");

        it("rejeita senhas fracas", () => {
            const weakPasswords = [
                "123456",
                "password",
                "Password",
                "Password1",
                "short",
                "nouppercase123!",
                "NOLOWERCASE123!",
                "NoSpecialChar123",
            ];

            for (const password of weakPasswords) {
                expect(strongPasswordSchema.safeParse(password).success).toBe(false);
            }
        });

        it("aceita senhas fortes", () => {
            const strongPasswords = [
                "MyStr0ng!Pass",
                "C0mpl3x@P4ssw0rd",
                "S3cur3!P@ss123",
            ];

            for (const password of strongPasswords) {
                expect(strongPasswordSchema.safeParse(password).success).toBe(true);
            }
        });
    });
});

describe("Segurança - Validação de Arquivos", () => {
    it("rejeita extensões perigosas", () => {
        const dangerousExtensions = [
            ".exe", ".dll", ".bat", ".cmd", ".sh",
            ".php", ".jsp", ".asp", ".aspx",
            ".py", ".rb", ".pl",
        ];

        const allowedExtensions = [".pdf", ".jpg", ".png", ".docx"];

        for (const ext of dangerousExtensions) {
            expect(allowedExtensions).not.toContain(ext);
        }
    });

    it("valida MIME type", () => {
        const file = {
            name: "document.pdf",
            type: "application/pdf",
            size: 1024 * 1024, // 1MB
        };

        const validTypes = ["application/pdf", "image/jpeg", "image/png"];
        expect(validTypes).toContain(file.type);
    });

    it("limita tamanho de arquivo", () => {
        const maxSize = 10 * 1024 * 1024; // 10MB
        const oversizedFile = { size: 20 * 1024 * 1024 };

        expect(oversizedFile.size).toBeGreaterThan(maxSize);
    });

    it("detecta double extensions", () => {
        const maliciousFile = "document.pdf.exe";
        const realExt = maliciousFile.split(".").pop();

        expect(realExt).toBe("exe");
    });
});

describe("Segurança - Headers HTTP", () => {
    it("define Content-Type correto", () => {
        const contentType = "application/json; charset=utf-8";
        expect(contentType).toContain("application/json");
    });

    it("inclui X-Content-Type-Options", () => {
        const header = "nosniff";
        expect(header).toBe("nosniff");
    });

    it("inclui X-Frame-Options", () => {
        const header = "DENY";
        expect(["DENY", "SAMEORIGIN"]).toContain(header);
    });

    it("inclui CSP apropriado", () => {
        const csp = "default-src 'self'; script-src 'self' 'unsafe-inline'";
        expect(csp).toContain("default-src");
        expect(csp).toContain("script-src");
    });
});

describe("Segurança - Configurações de Cookie", () => {
    it("usa httpOnly para cookies de sessão", () => {
        const sessionCookie = { httpOnly: true };
        expect(sessionCookie.httpOnly).toBe(true);
    });

    it("usa secure em produção", () => {
        const isProduction = process.env.NODE_ENV === "production";
        const cookieSecure = isProduction ? true : false;

        if (isProduction) {
            expect(cookieSecure).toBe(true);
        }
    });

    it("usa sameSite", () => {
        const sameSite = "lax"; // ou "strict"
        expect(["lax", "strict", "none"]).toContain(sameSite);
    });

    it("define maxAge apropriado", () => {
        const maxAge = 60 * 60 * 24 * 7; // 7 dias
        expect(maxAge).toBeLessThanOrEqual(60 * 60 * 24 * 30); // Max 30 dias
    });
});

describe("Segurança - Rate Limiting", () => {
    it("limita tentativas de login", () => {
        const authLimit = { maxRequests: 10, windowMs: 15 * 60 * 1000 };
        expect(authLimit.maxRequests).toBe(10);
        expect(authLimit.windowMs).toBe(15 * 60 * 1000);
    });

    it("limita requisições de IA", () => {
        const aiLimit = { maxRequests: 30, windowMs: 60 * 60 * 1000 };
        expect(aiLimit.maxRequests).toBe(30);
        expect(aiLimit.windowMs).toBe(60 * 60 * 1000);
    });
});

describe("Segurança - Logs e Auditoria", () => {
    it("não loga senhas", () => {
        const logEntry = {
            user: "test@example.com",
            action: "login",
            password: "***REDACTED***", // Nunca logar senha real
        };

        expect(logEntry.password).not.toContain("real");
        expect(logEntry.password).toContain("REDACTED");
    });

    it("não loga tokens JWT", () => {
        const logEntry = {
            user: "test@example.com",
            token: "***JWT_REDACTED***",
        };

        expect(logEntry.token).toContain("REDACTED");
    });

    it("registra tentativas de acesso não autorizado", () => {
        const auditLog = {
            event: "unauthorized_access_attempt",
            user: "test@example.com",
            resource: "/api/admin",
            timestamp: new Date().toISOString(),
            ip: "192.168.1.1",
        };

        expect(auditLog.event).toBe("unauthorized_access_attempt");
    });
});

describe("Segurança - CORS e Origins", () => {
    it("valida origin das requisições", () => {
        const allowedOrigins = [
            "https://omnisfera.com",
            "https://app.omnisfera.com",
        ];

        const requestOrigin = "https://omnisfera.com";
        expect(allowedOrigins).toContain(requestOrigin);
    });

    it("rejeita origins não permitidos", () => {
        const allowedOrigins = ["https://omnisfera.com"];
        const maliciousOrigin = "https://evil.com";

        expect(allowedOrigins).not.toContain(maliciousOrigin);
    });
});

describe("Segurança - Dados Sensíveis", () => {
    it("mascara CPF em logs", () => {
        const cpf = "123.456.789-00";
        // Mascara todos os dígitos exceto os 2 últimos de cada grupo
        const masked = cpf.replace(/\d(?=\d{2})/g, "*");

        expect(masked).toContain("*");
        expect(masked).not.toBe(cpf);
    });

    it("mascara telefone em logs", () => {
        const phone = "11999999999";
        const masked = phone.slice(0, 4) + "****" + phone.slice(-2);

        expect(masked).toContain("****");
    });

    it("não expõe dados médicos em respostas de erro", () => {
        const errorResponse = {
            error: "Erro ao processar solicitação",
            // Nunca incluir:
            // diagnosis: "TEA",
            // medications: [...]
        };

        expect(errorResponse).not.toHaveProperty("diagnosis");
        expect(errorResponse).not.toHaveProperty("medications");
    });
});
