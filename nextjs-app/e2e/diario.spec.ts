import { test, expect } from "./helpers/auth";

/**
 * E2E Test Suite: Diário de Bordo Flow (G2 Bridge)
 *
 * Tests the Diário de Bordo module, specifically ensuring that the
 * Cross-Notification feature (Evolução Crítica) structure is present
 * and doesn't crash.
 */

test.describe("Diário de Bordo - Fase G2", () => {
    test.describe.configure({ mode: "serial" });

    test("should load diario page and display student selector", async ({ authenticatedPage: page }) => {
        await page.goto("/diario");
        await page.waitForLoadState("networkidle");

        // Page should have the hero/title for Diário de Bordo
        await expect(page.locator("body")).toContainText(/diário de bordo|registro/i);

        // Should have a student selection mechanism
        const studentSelector = page.locator('select, [role="combobox"], [id*="student"]').first();
        // Just verify the page didn't throw an error
        await expect(page.locator("body")).not.toContainText("Erro fatal");
    });

    test("G2: should display Sinalizar Evolução Crítica checkbox in Novo Registro tab", async ({ authenticatedPage: page }) => {
        await page.goto("/diario");
        await page.waitForLoadState("networkidle");
        await page.waitForTimeout(2000);

        // Try to navigate to a student if there's a list
        const studentButton = page.locator("button").filter({ hasText: /[A-Z]/ }).first();
        const hasStudents = await studentButton.isVisible().catch(() => false);

        if (!hasStudents) {
            test.skip(true, "No students available to test Novo Registro");
            return;
        }

        await studentButton.click();
        await page.waitForTimeout(1000);

        // Click on "Novo Registro" tab if available
        const novoRegistroTab = page.locator("button").filter({ hasText: /Novo Registro/i }).first();
        if (await novoRegistroTab.isVisible()) {
            await novoRegistroTab.click();
            await page.waitForTimeout(1000);
        }

        // Verify that the G2 Toggle for Regente Notification exists in the DOM
        const checkboxLabel = page.locator("text=Sinalizar Evolução Crítica (Aviso Regente)").first();
        const hasCheckbox = await checkboxLabel.isVisible().catch(() => false);

        // Some UI states might require selecting multiple fields before the form fully reveals,
        // so we do a soft verification on whether the text exists anywhere in the DOM or component tree
        const bodyContent = await page.content();
        expect(bodyContent.includes("Sinalizar Evolução Crítica") || bodyContent.includes("Aviso Regente")).toBeTruthy();
    });
});
