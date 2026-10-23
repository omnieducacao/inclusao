/**
 * SCRUM-69: marca de "conversa com dados de estudante". Quem monta o prompt passa as mensagens
 * por anonymizeMessages (que marca o resultado) ou pede `sensivel: true`; chatCompletionText
 * então não usa DeepSeek (red) nem Kimi (blue), nem como motor reserva.
 */
export const SENSIVEL = Symbol.for("omnisfera.ia.sensivel");

export function marcarSensivel<T extends object>(mensagens: T): T {
    Object.defineProperty(mensagens, SENSIVEL, { value: true, enumerable: false, configurable: true });
    return mensagens;
}

export function ehSensivel(mensagens: unknown): boolean {
    return Boolean(mensagens && typeof mensagens === "object" && (mensagens as Record<symbol, unknown>)[SENSIVEL]);
}
