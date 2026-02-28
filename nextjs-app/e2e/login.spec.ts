import { test, expect } from "@playwright/test";

/**
 * Teste E2E básico — Login (5.1.2)
 * Requer servidor rodando e credenciais válidas para teste completo.
 */
test.describe("Login", () => {
  test("página de login carrega", async ({ page }) => {
    await page.goto("/login");
    await expect(page).toHaveTitle(/Omnisfera|Login/i);
    await expect(page.getByRole("heading", { name: /bem-vindo|acesso administrativo/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /entrar/i })).toBeVisible();
  });

  test("página de privacidade acessível", async ({ page }) => {
    await page.goto("/privacidade");
    await expect(page.getByRole("heading", { name: /política de privacidade/i })).toBeVisible();
  });
});
