/**
 * Shared JWT secret helper — used by middleware.ts and lib/session.ts
 * Single source of truth for SESSION_SECRET handling.
 */

let _secret: Uint8Array | null = null;

export function getSecret(): Uint8Array {
    if (!_secret) {
        const raw = process.env.SESSION_SECRET;
        if (!raw && process.env.NODE_ENV === "production") {
            throw new Error(
                "🔒 FATAL: SESSION_SECRET não está definida em produção. " +
                "Defina a variável de ambiente SESSION_SECRET antes de iniciar a aplicação. " +
                "Sem ela, os tokens JWT podem ser forjados por qualquer pessoa."
            );
        }
        _secret = new TextEncoder().encode(raw || "omnisfera-dev-secret-change-in-prod");
    }
    return _secret;
}
