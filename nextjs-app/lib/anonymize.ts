/**
 * Anonimização de dados sensíveis nos prompts enviados para IA.
 * Remove nomes reais de estudantes e responsáveis antes de enviar
 * para provedores de IA externos, garantindo compliance LGPD.
 */

/**
 * Substitui nomes próprios por tokens genéricos nos prompts.
 * Funciona com nome completo e primeiro nome.
 *
 * @example
 * anonymize("João Silva tem dificuldade...", "João Silva")
 * // → "[ESTUDANTE] tem dificuldade..."
 */
export function anonymizePrompt(
    prompt: string,
    studentName?: string | null,
    additionalNames?: Record<string, string>
): string {
    let result = prompt;

    // Substituir nome do estudante
    if (studentName && studentName.trim().length > 1) {
        const name = studentName.trim();
        // Nome completo primeiro (para não deixar sobrenome solto)
        result = replaceAllCaseInsensitive(result, name, "[ESTUDANTE]");
        // Primeiro nome (se tiver mais de 3 chars para evitar falsos positivos)
        const firstName = name.split(/\s+/)[0];
        if (firstName && firstName.length > 3) {
            result = replaceAllCaseInsensitive(result, firstName, "[ESTUDANTE]");
        }
    }

    // Substituir nomes adicionais (responsáveis, profissionais, etc.)
    if (additionalNames) {
        for (const [token, name] of Object.entries(additionalNames)) {
            if (name && name.trim().length > 1) {
                result = replaceAllCaseInsensitive(result, name.trim(), `[${token}]`);
            }
        }
    }

    return result;
}

/**
 * Restaura tokens genéricos de volta para nomes reais na resposta da IA.
 * Usado para devolver o resultado com os nomes corretos para o frontend.
 */
export function deanonymizeResponse(
    response: string,
    studentName?: string | null,
    additionalNames?: Record<string, string>
): string {
    let result = response;

    if (studentName && studentName.trim().length > 1) {
        result = result.replaceAll("[ESTUDANTE]", studentName.trim());
    }

    if (additionalNames) {
        for (const [token, name] of Object.entries(additionalNames)) {
            if (name && name.trim().length > 1) {
                result = result.replaceAll(`[${token}]`, name.trim());
            }
        }
    }

    return result;
}

/** Replace case-insensitive sem depender de regex (performance). */
function replaceAllCaseInsensitive(str: string, search: string, replacement: string): string {
    if (!search) return str;
    const lower = str.toLowerCase();
    const searchLower = search.toLowerCase();
    let result = "";
    let lastIndex = 0;

    let index = lower.indexOf(searchLower, lastIndex);
    while (index !== -1) {
        result += str.slice(lastIndex, index) + replacement;
        lastIndex = index + search.length;
        index = lower.indexOf(searchLower, lastIndex);
    }
    result += str.slice(lastIndex);
    return result;
}
