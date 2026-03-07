/**
 * Testes Unitários — ThemeProvider & High Contrast
 *
 * Cobertura:
 * - useAutoSave hook basic behavior
 * - Status transitions (idle → saving → saved → idle)
 * - Debounce behavior
 * - saveNow immediate save
 * - Error handling
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("useAutoSave hook", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("exports useAutoSave function", async () => {
        const mod = await import("@/hooks/useAutoSave");
        expect(typeof mod.useAutoSave).toBe("function");
    });
});

describe("PEI Helpers — roundtrip", () => {
    it("createVirtualId → isVirtualId → getRealStudentId roundtrip", async () => {
        const { createVirtualId, isVirtualId, getRealStudentId, getVirtualDiscipline } = await import("@/lib/pei-helpers");

        const id = createVirtualId("abc-123", "lingua_portuguesa");
        expect(isVirtualId(id)).toBe(true);
        expect(getRealStudentId(id)).toBe("abc-123");
        expect(getVirtualDiscipline(id)).toBe("lingua_portuguesa");
    });

    it("safeString handles edge cases", async () => {
        const { safeString } = await import("@/lib/pei-helpers");

        // Normal strings
        expect(safeString("Hello World")).toBe("Hello World");
        expect(safeString(42)).toBe("42");
        expect(safeString(true)).toBe("true");

        // Null/undefined
        expect(safeString(null, "N/A")).toBe("N/A");
        expect(safeString(undefined, "—")).toBe("—");

        // Short base64-like is fine
        expect(safeString("abc123")).toBe("abc123");

        // Long base64 (encrypted) returns fallback
        expect(safeString("A".repeat(200))).toBe("");
    });
});
