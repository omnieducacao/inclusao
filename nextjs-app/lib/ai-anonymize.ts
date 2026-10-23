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
import { criarMascaraPII, type OpcoesPII } from "./pii";
import { marcarSensivel } from "./ai-sensivel";

export type ChatMessage = { role: string; content: string };

/**
 * Anonimiza todas as mensagens (system + user): nome do estudante e nomes adicionais viram
 * tokens ([ESTUDANTE]...) e CPF, RG, e-mail, telefone, nascimento, registro profissional e
 * nomes de responsável/médico viram tokens numerados ([CPF_1]...). Retorna as mensagens
 * anonimizadas e uma função `restore` que devolve tudo na resposta da IA.
 *
 * Se a conversa tem dados de estudante (nome informado ou algum dado pessoal achado), o
 * resultado fica marcado como sensível: chatCompletionText não usa DeepSeek nem Kimi nela.
 *
 * @param messages - Array de mensagens {role, content} enviadas para a IA
 * @param studentName - Nome completo do estudante (pode ser null/undefined)
 * @param additionalNames - Mapa de nomes adicionais {TOKEN: "nome"} (responsáveis, médicos)
 * @param opcoes - Nomes que a rota conhece (escola, responsáveis) para a máscara de PII
 */
export function anonymizeMessages(
    messages: ChatMessage[],
    studentName?: string | null,
    additionalNames?: Record<string, string>,
    opcoes?: OpcoesPII
): { anonymized: ChatMessage[]; restore: (text: string) => string } {
    const mascara = criarMascaraPII(opcoes);
    const anonymized = messages.map((msg) => ({
        role: msg.role,
        content: mascara.mascarar(anonymizePrompt(msg.content, studentName, additionalNames)),
    }));

    const temNome = Boolean(studentName?.trim()) || Boolean(additionalNames && Object.keys(additionalNames).length > 0);
    if (temNome || mascara.total > 0) marcarSensivel(anonymized);

    const restore = (text: string): string => mascara.restaurar(deanonymizeResponse(text, studentName, additionalNames));
    return { anonymized, restore };
}

/**
 * Anonimiza uma única string de prompt.
 * Atalho para casos onde não se usa o formato de mensagens.
 */
export function anonymizeText(
    text: string,
    studentName?: string | null,
    additionalNames?: Record<string, string>,
    opcoes?: OpcoesPII
): { anonymized: string; restore: (text: string) => string; sensivel: boolean } {
    const mascara = criarMascaraPII(opcoes);
    const anonymized = mascara.mascarar(anonymizePrompt(text, studentName, additionalNames));
    const temNome = Boolean(studentName?.trim()) || Boolean(additionalNames && Object.keys(additionalNames).length > 0);
    const restore = (t: string): string => mascara.restaurar(deanonymizeResponse(t, studentName, additionalNames));
    return { anonymized, restore, sensivel: temNome || mascara.total > 0 };
}
