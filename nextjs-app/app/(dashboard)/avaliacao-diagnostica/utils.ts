// ─── Pure utility functions extracted from AvaliacaoDiagnosticaClient ─────────

/** Extrai o nível SAEB (I, II, III) do campo competencia */
export function extractSaebLevel(competencia: string): string | null {
    const m = competencia.match(/^(I{1,3})\s*[–\-—]/i);
    return m ? m[1].toUpperCase() : null;
}

/** Flatten nested PEI barreiras (domain→barrier→bool) into flat map (barrier→true) */
export function flattenBarreiras(barreiras?: Record<string, Record<string, boolean>>): Record<string, boolean> {
    if (!barreiras) return {};
    const flat: Record<string, boolean> = {};
    for (const domain of Object.values(barreiras)) {
        if (domain && typeof domain === 'object') {
            for (const [key, val] of Object.entries(domain)) {
                if (val === true) flat[key] = true;
            }
        }
    }
    return flat;
}

/** Extrair questões do markdown ou JSON — retorna array de {gabarito, habilidade} */
export function extrairQuestoes(texto: string): { gabarito: string; habilidade: string }[] {
    // 1) Try to parse as JSON first (AI sometimes returns JSON despite markdown prompt)
    try {
        const cleaned = texto.replace(/```(?:json)?\s*([\s\S]*?)```/, "$1").trim();
        const parsed = JSON.parse(cleaned);
        if (parsed?.questoes && Array.isArray(parsed.questoes)) {
            return parsed.questoes.map((q: { gabarito?: string; habilidade_bncc_ref?: string }) => ({
                gabarito: (q.gabarito || "").toUpperCase(),
                habilidade: q.habilidade_bncc_ref || "",
            }));
        }
    } catch { /* not JSON, continue to regex */ }

    // 2) Multi-pattern regex extraction from markdown text
    const questoes: { gabarito: string; habilidade: string }[] = [];

    // Pattern A: "**Gabarito: X**" or "Gabarito: X" or "Resposta correta: X"
    const gabRegex1 = /(?:\*{0,2})(?:gabarito|resposta\s*correta)(?:\*{0,2})\s*[:]\s*\*{0,2}\s*([A-Ea-e])\s*\*{0,2}/gi;
    // Pattern B: "**GABARITO (letra X):**" or "GABARITO (X):"
    const gabRegex2 = /GABARITO\s*\(\s*(?:letra\s+)?([A-Ea-e])\s*\)/gi;
    // Pattern C: "alternativa correta: X" or "Resposta: X"
    const gabRegex3 = /(?:alternativa\s*correta|resposta)\s*[:]\s*\*{0,2}\s*([A-Ea-e])\s*\*{0,2}/gi;

    const habRegex = /(?:\*{0,2})(?:habilidade|BNCC|habilidade_bncc)(?:\*{0,2})\s*[:]\s*\*{0,2}\s*([^\n*]+)/gi;

    const gabs: string[] = [];
    const habs: string[] = [];
    let m: RegExpExecArray | null;

    // Try all gabarito patterns
    while ((m = gabRegex1.exec(texto)) !== null) gabs.push(m[1].toUpperCase());
    if (gabs.length === 0) {
        while ((m = gabRegex2.exec(texto)) !== null) gabs.push(m[1].toUpperCase());
    }
    if (gabs.length === 0) {
        while ((m = gabRegex3.exec(texto)) !== null) gabs.push(m[1].toUpperCase());
    }

    while ((m = habRegex.exec(texto)) !== null) habs.push(m[1].trim());

    for (let i = 0; i < gabs.length; i++) {
        // Clamp to A-D (UI only shows 4 options)
        const g = gabs[i] === "E" ? "D" : gabs[i];
        questoes.push({ gabarito: g, habilidade: habs[i] || "" });
    }
    return questoes;
}
