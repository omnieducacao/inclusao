/**
 * Utilitários defensivos para dados potencialmente inválidos/órfãos.
 *
 * Cenários protegidos:
 * - student deletado mas pei_disciplina ainda existe (cascade pending)
 * - plano_ensino deletado mas pei_disciplina.plano_ensino_id é stale
 * - pei_data corrompido (null, string instead of object, etc.)
 * - name/grade vazio ou encrypted gibberish
 */

// ─── Safe field access ──────────────────────────────────────────────────

/** Returns a fallback if value is null, undefined, empty string, or "null" */
export function safeStr(value: unknown, fallback = "—"): string {
    if (value === null || value === undefined) return fallback;
    const s = String(value).trim();
    if (s === "" || s === "null" || s === "undefined") return fallback;
    return s;
}

/** Safely parse a number, returning null if invalid */
export function safeNum(value: unknown): number | null {
    if (value === null || value === undefined) return null;
    const n = Number(value);
    return isNaN(n) ? null : n;
}

/** Safely parse pei_data (handles null, string, object) */
export function safePeiData(raw: unknown): Record<string, unknown> {
    if (!raw) return {};
    if (typeof raw === "string") {
        try {
            return JSON.parse(raw) || {};
        } catch {
            return {};
        }
    }
    if (typeof raw === "object" && !Array.isArray(raw)) {
        return raw as Record<string, unknown>;
    }
    return {};
}

/** Safely access nested pei_data field */
export function peiField<T>(peiData: Record<string, unknown>, key: string, fallback: T): T {
    const value = peiData[key];
    if (value === null || value === undefined) return fallback;
    return value as T;
}

// ─── Safe array access ──────────────────────────────────────────────────

/** Ensures value is always an array */
export function safeArray<T>(value: unknown): T[] {
    if (Array.isArray(value)) return value;
    return [];
}

// ─── API response validation ────────────────────────────────────────────

/** Safely parse API JSON response (handles HTML error pages) */
export async function safeJson<T>(res: Response, fallback: T): Promise<T> {
    try {
        const contentType = res.headers.get("content-type");
        if (!contentType?.includes("application/json")) {
            console.warn(`[safeJson] Non-JSON response (${contentType})`);
            return fallback;
        }
        return await res.json();
    } catch (err) {
        console.warn("[safeJson] Failed to parse JSON:", err);
        return fallback;
    }
}

// ─── Orphan detection helpers (server-side) ─────────────────────────────

/**
 * Check if a student_id still exists in the students table.
 * Useful in API handlers before doing heavy operations.
 */
export async function studentExists(
    supabase: { from: (table: string) => { select: (cols: string) => { eq: (col: string, val: string) => { maybeSingle: () => Promise<{ data: unknown }> } } } },
    studentId: string,
    workspaceId: string
): Promise<boolean> {
    const { data } = await supabase
        .from("students")
        .select("id")
        .eq("id", studentId)
        .maybeSingle();
    // Also check workspace_id if needed
    return !!data;
}

/**
 * Check if a plano_ensino_id still exists.
 * Returns null if orphaned (safe for SET NULL pattern).
 */
export async function planoExists(
    supabase: { from: (table: string) => { select: (cols: string) => { eq: (col: string, val: string) => { maybeSingle: () => Promise<{ data: unknown }> } } } },
    planoId: string | null
): Promise<boolean> {
    if (!planoId) return false;
    const { data } = await supabase
        .from("planos_ensino")
        .select("id")
        .eq("id", planoId)
        .maybeSingle();
    return !!data;
}
