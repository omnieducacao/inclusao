/**
 * PEI Helper Functions
 * 
 * Centralizes common PEI logic like virtual ID handling,
 * preventing repetition of inline checks throughout PEI Regente.
 */

// ─── Virtual ID helpers ────────────────────────────────────────────────
// PEI Regente uses "virtual" IDs like "virtual_abc123_portugues" for
// students who are extras (not directly mapped). These helpers centralize
// the logic previously scattered as inline String().startsWith("virtual_").

/**
 * Check if an ID is a virtual composite (extra student in PEI Regente).
 */
export function isVirtualId(id: string | null | undefined): boolean {
    if (!id) return false;
    return String(id).startsWith("virtual_");
}

/**
 * Extract the real student ID from a virtual ID.
 * "virtual_abc123_portugues" → "abc123"
 */
export function getRealStudentId(id: string): string {
    if (!isVirtualId(id)) return id;
    const parts = id.split("_");
    // Format: virtual_{studentId}_{disciplina}
    return parts.length >= 2 ? parts[1] : id;
}

/**
 * Extract the discipline name from a virtual ID.
 * "virtual_abc123_portugues" → "portugues"
 */
export function getVirtualDiscipline(id: string): string | null {
    if (!isVirtualId(id)) return null;
    const parts = id.split("_");
    return parts.length >= 3 ? parts.slice(2).join("_") : null;
}

/**
 * Create a virtual ID from a student ID and discipline.
 */
export function createVirtualId(studentId: string, discipline: string): string {
    return `virtual_${studentId}_${discipline}`;
}

// ─── PEI Data helpers ──────────────────────────────────────────────────

/**
 * Check if PEI data has meaningful content (not just default/empty state).
 */
export function hasMeaningfulPeiData(peiData: Record<string, unknown> | null | undefined): boolean {
    if (!peiData) return false;
    const keys = Object.keys(peiData);
    if (keys.length === 0) return false;
    // Check if at least one field has non-empty/non-default content
    return keys.some(key => {
        const val = peiData[key];
        if (val === null || val === undefined || val === "") return false;
        if (Array.isArray(val) && val.length === 0) return false;
        return true;
    });
}

/**
 * Safe field extractor for potentially invalid/orphan data.
 */
export function safeString(value: unknown, fallback: string = ""): string {
    if (value === null || value === undefined) return fallback;
    const s = String(value);
    // Detect encrypted gibberish (typical AES-256 base64)
    if (s.length > 100 && /^[A-Za-z0-9+/=]+$/.test(s)) return fallback;
    return s;
}
