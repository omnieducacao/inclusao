import { test as base, expect, Page } from "@playwright/test";

/**
 * Helper para autenticação nos testes E2E.
 *
 * Para rodar os testes com autenticação, defina:
 *   E2E_USER_EMAIL=professor@test.com
 *   E2E_USER_PASSWORD=senha123
 *
 * Sem essas variáveis, authenticatedPage usa a page normal (sem login).
 */

type AuthFixtures = {
    authenticatedPage: Page;
};

export const test = base.extend<AuthFixtures>({
    authenticatedPage: async ({ page }: { page: Page }, use: (page: Page) => Promise<void>) => {
        const email = process.env.E2E_USER_EMAIL;
        const password = process.env.E2E_USER_PASSWORD;

        if (!email || !password) {
            console.warn("⚠️  E2E_USER_EMAIL / E2E_USER_PASSWORD not set — skipping auth");
            await use(page);
            return;
        }

        // Login flow
        await page.goto("/login");
        await page.getByPlaceholder(/email/i).fill(email);
        await page.getByPlaceholder(/senha/i).fill(password);
        await page.getByRole("button", { name: /entrar/i }).click();

        // Wait for redirect to home
        await page.waitForURL("**/", { timeout: 15000 });
        await expect(page.locator("body")).not.toContainText("Erro");

        await use(page);
    },
});

export { expect };
