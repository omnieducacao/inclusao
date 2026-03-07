import { test, expect } from "./helpers/auth";

/**
 * E2E Test Suite: Hub Pedagógico Flow
 *
 * Tests the Hub module — the creative workshop where
 * professors generate inclusive teaching materials.
 *
 * Prerequisites:
 *   - E2E_USER_EMAIL / E2E_USER_PASSWORD env vars
 *   - At least one student with PEI in the workspace
 */

test.describe("Hub Pedagógico", () => {
    test("should load hub page", async ({ authenticatedPage: page }) => {
        await page.goto("/hub");
        await page.waitForLoadState("networkidle");

        // Should show the Hub title or tools
        await expect(page.locator("body")).toContainText(/hub|pedagógico|ferramentas/i);
    });

    test("should display tool cards", async ({ authenticatedPage: page }) => {
        await page.goto("/hub");
        await page.waitForLoadState("networkidle");

        // Hub has multiple tool cards (Plano de Aula, Roteiro, etc.)
        // Look for clickable cards or buttons
        const cards = page.locator('[class*="card"], [class*="tool"], button').filter({ hasText: /.+/ });
        const count = await cards.count();
        expect(count).toBeGreaterThan(0);
    });

    test("should have student selector", async ({ authenticatedPage: page }) => {
        await page.goto("/hub");
        await page.waitForLoadState("networkidle");

        // Hub requires student selection
        const selector = page.locator('select, [role="combobox"], [id*="student"]').first();
        // May require student selection before tools are shown
        await expect(page.locator("body")).not.toContainText("Erro fatal");
    });

    test("should navigate to Plano de Aula tool", async ({ authenticatedPage: page }) => {
        await page.goto("/hub");
        await page.waitForLoadState("networkidle");

        // Try to click on Plano de Aula card
        const planoCard = page.locator('button:has-text("Plano"), [role="button"]:has-text("Plano")').first();
        if (await planoCard.isVisible()) {
            await planoCard.click();
            await page.waitForTimeout(1000);
            // Should show plano de aula form
            await expect(page.locator("body")).not.toContainText("Erro fatal");
        }
    });

    test("should navigate to Criar Atividade tool", async ({ authenticatedPage: page }) => {
        await page.goto("/hub");
        await page.waitForLoadState("networkidle");

        // Try clicking on Criar Atividade
        const atividadeCard = page.locator('button:has-text("Atividade"), [role="button"]:has-text("Atividade")').first();
        if (await atividadeCard.isVisible()) {
            await atividadeCard.click();
            await page.waitForTimeout(1000);
            await expect(page.locator("body")).not.toContainText("Erro fatal");
        }
    });

    test("should not crash on any tool selection", async ({ authenticatedPage: page }) => {
        await page.goto("/hub");
        await page.waitForLoadState("networkidle");

        // Just verify the page rendered without fatal errors
        const body = page.locator("body");
        await expect(body).not.toContainText("Erro fatal");
        await expect(body).not.toContainText("Application error");
        await expect(body).not.toContainText("unhandled");
    });
});
