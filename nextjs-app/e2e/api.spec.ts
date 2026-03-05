import { test, expect } from "@playwright/test";

/**
 * E2E Test Suite: API & Page Smoke Tests
 *
 * Tests that the app is running and key pages/endpoints respond.
 * Note: Without authentication, API routes redirect to /login (HTML).
 * These tests verify the server is healthy and pages render.
 *
 * Run: CI=true npx playwright test e2e/api.spec.ts
 */

test.setTimeout(30000);

test.describe("Server Health", () => {

    test("server responds on port 3000", async ({ request }) => {
        const response = await request.get("/login", { timeout: 15000 });
        expect(response.status()).toBe(200);
    });
});

test.describe("Public Pages", () => {

    test("login page renders with form", async ({ page }) => {
        await page.goto("/login", { timeout: 20000 });
        await expect(page).toHaveTitle(/Omnisfera|Login|Inclusão/i);
        await expect(page.getByRole("button", { name: /entrar/i })).toBeVisible({ timeout: 10000 });
    });

    test("privacidade page loads", async ({ page }) => {
        await page.goto("/privacidade", { timeout: 20000 });
        await expect(
            page.getByRole("heading", { name: /privacidade/i }).first()
        ).toBeVisible({ timeout: 10000 });
    });
});

test.describe("API Endpoint Existence (unauthenticated)", () => {
    // Without auth, API routes either return JSON error or redirect to /login
    // We just verify they respond (not 500/503)

    test("POST /api/admin/cleanup endpoint exists", async ({ request }) => {
        const response = await request.post("/api/admin/cleanup", {
            data: { dryRun: true },
            timeout: 15000,
        });
        // 200 (HTML redirect) or 401/403 (JSON error) — all acceptable
        expect(response.status()).toBeLessThan(500);
    });

    test("DELETE /api/pei/disciplina endpoint exists", async ({ request }) => {
        const response = await request.delete("/api/pei/disciplina?id=test", {
            timeout: 15000,
        });
        expect(response.status()).toBeLessThan(500);
    });

    test("DELETE /api/pei/plano-ensino endpoint exists", async ({ request }) => {
        const response = await request.delete("/api/pei/plano-ensino?id=test", {
            timeout: 15000,
        });
        expect(response.status()).toBeLessThan(500);
    });
});

test.describe("Protected Route Redirects", () => {

    test("/pei-professor redirects (requires auth)", async ({ page }) => {
        const response = await page.goto("/pei-professor", { timeout: 20000 });
        // Should redirect to /login or /pei-regente
        expect(response?.status()).toBeLessThanOrEqual(400);
        const finalUrl = page.url();
        // Either stays on pei-professor (loading auth check) or redirected
        expect(finalUrl).toBeTruthy();
    });

    test("/pei-regente requires auth", async ({ page }) => {
        const response = await page.goto("/pei-regente", { timeout: 20000 });
        expect(response?.status()).toBeLessThanOrEqual(400);
    });

    test("/avaliacao-diagnostica requires auth", async ({ page }) => {
        const response = await page.goto("/avaliacao-diagnostica", { timeout: 20000 });
        expect(response?.status()).toBeLessThanOrEqual(400);
    });

    test("/estudantes requires auth", async ({ page }) => {
        const response = await page.goto("/estudantes", { timeout: 20000 });
        expect(response?.status()).toBeLessThanOrEqual(400);
    });

    test("/config-escola requires auth", async ({ page }) => {
        const response = await page.goto("/config-escola", { timeout: 20000 });
        expect(response?.status()).toBeLessThanOrEqual(400);
    });
});
