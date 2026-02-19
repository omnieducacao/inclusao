/**
 * LGPD — Anonimização de dados pessoais em prompts de IA (Art. 11, Art. 13).
 *
 * Wrapper que intercepta mensagens ANTES de enviar para provedores de IA
 * externos (DeepSeek, OpenAI, Claude, Gemini, Kimi) e restaura nomes
 * nas respostas DEPOIS de receber.
 *
 * Uso:
 *   const { anonymized, restore } = anonymizeMessages(messages, studentName);
 *   const textoRaw = await chatCompletionText(engine, anonymized);
 *   const texto = restore(textoRaw);
 */

import { anonymizePrompt, deanonymizeResponse } from "./anonymize";

export type ChatMessage = { role: string; content: string };

/**
 * Anonimiza todas as mensagens (system + user) substituindo nomes por tokens.
 * Retorna as mensagens anonimizadas e uma função `restore` para reverter
 * a anonimização na resposta da IA.
 *
 * @param messages - Array de mensagens {role, content} enviadas para a IA
 * @param studentName - Nome completo do estudante (pode ser null/undefined)
 * @param additionalNames - Mapa de nomes adicionais {TOKEN: "nome"} (responsáveis, médicos)
 */
export function anonymizeMessages(
    messages: ChatMessage[],
    studentName?: string | null,
    additionalNames?: Record<string, string>
): { anonymized: ChatMessage[]; restore: (text: string) => string } {
    // Se não há nome para anonimizar, retorna as mensagens originais
    if (!studentName?.trim() && (!additionalNames || Object.keys(additionalNames).length === 0)) {
        return {
            anonymized: messages,
            restore: (text: string) => text,
        };
    }

    const anonymized = messages.map((msg) => ({
        role: msg.role,
        content: anonymizePrompt(msg.content, studentName, additionalNames),
    }));

    const restore = (text: string): string => {
        return deanonymizeResponse(text, studentName, additionalNames);
    };

    return { anonymized, restore };
}

/**
 * Anonimiza uma única string de prompt.
 * Atalho para casos onde não se usa o formato de mensagens.
 */
export function anonymizeText(
    text: string,
    studentName?: string | null,
    additionalNames?: Record<string, string>
): { anonymized: string; restore: (text: string) => string } {
    if (!studentName?.trim() && (!additionalNames || Object.keys(additionalNames).length === 0)) {
        return { anonymized: text, restore: (t: string) => t };
    }

    const anonymized = anonymizePrompt(text, studentName, additionalNames);
    const restore = (t: string): string => deanonymizeResponse(t, studentName, additionalNames);

    return { anonymized, restore };
}
