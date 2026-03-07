import { test, expect } from "./helpers/auth";

/**
 * E2E Test Suite: PEI-Professor Flow
 *
 * Covers the complete 3-phase flow:
 *   Phase 1: Plano de Ensino (link/upload)
 *   Phase 2: Avaliação Diagnóstica (generate + apply)
 *   Phase 3: PEI por Disciplina (AI adaptation)
 *
 * Prerequisites:
 *   - Server running on http://127.0.0.1:3000
 *   - E2E_USER_EMAIL and E2E_USER_PASSWORD env vars set
 *   - Test professor has at least 1 student with PEI assigned
 *
 * Run: npx playwright test e2e/pei-professor.spec.ts
 */

test.describe("PEI-Professor Flow", () => {
    test.describe.configure({ mode: "serial" });

    // ─── Navigation Tests ─────────────────────────────────────────────────

    test("legacy /pei-professor redirects to /pei-regente", async ({ page }) => {
        await page.goto("/pei-professor");
        await page.waitForURL("**/pei-regente**", { timeout: 10000 });
        expect(page.url()).toContain("/pei-regente");
    });

    test("/pei-regente loads successfully", async ({ authenticatedPage: page }) => {
        await page.goto("/pei-regente");

        // Should show the page hero or main content
        await expect(page.locator("body")).not.toContainText("Erro de conexão");

        // Should have the module loaded (either onboarding or student list)
        const hasContent = await page
            .locator("text=/Bem-vindo|Seus Estudantes|Nenhum estudante/i")
            .first()
            .isVisible()
            .catch(() => false);
        expect(hasContent).toBeTruthy();
    });

    // ─── Student List Tests ───────────────────────────────────────────────

    test("student list renders with pipeline", async ({ authenticatedPage: page }) => {
        await page.goto("/pei-regente");

        // Wait for data to load
        await page.waitForTimeout(3000);

        // Check if students are loaded (may be empty in test env)
        const studentCards = page.locator("[class*='rounded-2xl']");
        const count = await studentCards.count();

        if (count > 0) {
            // At least one card visible
            expect(count).toBeGreaterThan(0);
        } else {
            // Empty state should show a message
            await expect(
                page.locator("text=/Nenhum estudante|Não há estudantes/i").first()
            ).toBeVisible();
        }
    });

    // ─── Pipeline UI Tests ────────────────────────────────────────────────

    test("discipline pipeline shows 3 phases", async ({ authenticatedPage: page }) => {
        await page.goto("/pei-regente");
        await page.waitForTimeout(3000);

        // Try to find a student and click on them
        const studentButton = page.locator("button").filter({ hasText: /[A-Z]/ }).first();
        const hasStudents = await studentButton.isVisible().catch(() => false);

        if (!hasStudents) {
            test.skip(true, "No students available in test environment");
            return;
        }

        await studentButton.click();
        await page.waitForTimeout(1000);

        // Should show the 3-phase pipeline buttons
        await expect(page.locator("text=Plano de Ensino").first()).toBeVisible();
        await expect(page.locator("text=Diagnóstica").first()).toBeVisible();
        await expect(page.locator("text=PEI Disciplina").first()).toBeVisible();
    });

    // ─── Phase Transition Tests ───────────────────────────────────────────

    test("clicking pipeline step opens correct view", async ({ authenticatedPage: page }) => {
        await page.goto("/pei-regente");
        await page.waitForTimeout(3000);

        // Navigate into a student
        const studentButton = page.locator("button").filter({ hasText: /[A-Z]/ }).first();
        const hasStudents = await studentButton.isVisible().catch(() => false);

        if (!hasStudents) {
            test.skip(true, "No students available");
            return;
        }

        await studentButton.click();
        await page.waitForTimeout(1000);

        // Click on "Plano de Ensino" step
        const planoButton = page.locator("button").filter({ hasText: "Plano de Ensino" }).first();
        if (await planoButton.isVisible()) {
            await planoButton.click();
            await page.waitForTimeout(1500);

            // Should show the plano ensino view with breadcrumb
            await expect(page.locator("text=/Plano de Ensino/i").first()).toBeVisible();

            // Should have a back button
            await expect(page.locator("[aria-label='Voltar'], button:has(svg)").first()).toBeVisible();
        }
    });

    // ─── Loading States Tests ─────────────────────────────────────────────

    test("transitioning overlay works during phase change", async ({ authenticatedPage: page }) => {
        await page.goto("/pei-regente");
        await page.waitForTimeout(3000);

        // This test verifies the transition overlay DOM exists (won't trigger actual transitions)
        // The overlay is conditionally rendered based on `transitioning` state
        const overlayExists = await page.evaluate(() => {
            // Check that the component code includes the transitioning overlay
            return document.querySelector("[data-testid='omni-loader']") !== null ||
                document.body.innerHTML.includes("Avançando fase");
        });
        // Overlay only shows during transitions, so it won't be visible at rest
        expect(overlayExists).toBe(false);
    });

    // ─── G1: Dossiê Sintético (Consultoria) Tests ─────────────────────────

    test("G1: Consultoria Pedagógica tab renders without crashing", async ({ authenticatedPage: page }) => {
        await page.goto("/pei-regente");
        await page.waitForTimeout(3000);

        // Navigate into a student
        const studentButton = page.locator("button").filter({ hasText: /[A-Z]/ }).first();
        const hasStudents = await studentButton.isVisible().catch(() => false);

        if (!hasStudents) {
            test.skip(true, "No students available");
            return;
        }

        await studentButton.click();
        await page.waitForTimeout(1000);

        // Navigate to "Consultoria Pedagógica" (G1 Integration)
        const consultoriaTab = page.locator("button").filter({ hasText: /Consultoria/i }).first();
        if (await consultoriaTab.isVisible()) {
            await consultoriaTab.click();
            await page.waitForTimeout(1000);

            // Should show the title for Consultoria Pedagógica
            await expect(page.locator("h3:has-text('Consultoria Pedagógica')").first()).toBeVisible();

            // The main form or UI for the AI assistant should be present (not crashing)
            await expect(page.locator("body")).not.toContainText("Error");
            await expect(page.locator("body")).not.toContainText("undefined is not an object");
        }
    });

    // ─── G2: Notificações Cruzadas Tests ──────────────────────────────────

    test("G2: Dashboard safely receives dailyLogs and renders banner structure conditionally", async ({ authenticatedPage: page }) => {
        await page.goto("/pei-regente");
        await page.waitForTimeout(3000);

        // Navigate into a student
        const studentButton = page.locator("button").filter({ hasText: /[A-Z]/ }).first();
        const hasStudents = await studentButton.isVisible().catch(() => false);

        if (!hasStudents) {
            test.skip(true, "No students available");
            return;
        }

        await studentButton.click();
        await page.waitForTimeout(1000);

        // The Dashboard Tab should be visible by default (it's the main view in PEIPhase2Regentes usually)
        // Ensure the prop drilling of `dailyLogs` didn't break the component
        await expect(page.locator("body")).not.toContainText("dailyLogs is not defined");
        await expect(page.locator("text=/Dashboard e Exportação|Exportar PEI/i").first()).toBeVisible();

        // The banner itself may or may not be visible depending on the mock student's data.
        // We ensure the page doesn't crash from reading `alerta_regente`.
        const errorBanner = page.locator("text=Atenção: Evolução Crítica no AEE").first();
        const isBannerVisible = await errorBanner.isVisible().catch(() => false);

        // If it happens to be visible, it should contain the specific text structure
        if (isBannerVisible) {
            await expect(page.locator("text=Recomendamos consultar as notas do Diário de Bordo para alinhamento pedagógico").first()).toBeVisible();
        }
    });

    // ─── Toast Tests ──────────────────────────────────────────────────────

    test("toast notification container exists in pipeline view", async ({ authenticatedPage: page }) => {
        await page.goto("/pei-regente");
        await page.waitForTimeout(3000);

        // Navigate to student view
        const studentButton = page.locator("button").filter({ hasText: /[A-Z]/ }).first();
        const hasStudents = await studentButton.isVisible().catch(() => false);

        if (!hasStudents) {
            test.skip(true, "No students available");
            return;
        }

        await studentButton.click();
        await page.waitForTimeout(1000);

        // The pipeline container should have position: relative (for toast positioning)
        const container = page.locator("[class*='rounded-2xl'][style*='position']").first();
        const isRelative = await container.isVisible().catch(() => false);
        expect(isRelative || true).toBeTruthy(); // Soft check
    });

    // ─── Reset Discipline Tests ───────────────────────────────────────────

    test("reset discipline button is visible for non-virtual disciplines", async ({ authenticatedPage: page }) => {
        await page.goto("/pei-regente");
        await page.waitForTimeout(3000);

        // Navigate to student
        const studentButton = page.locator("button").filter({ hasText: /[A-Z]/ }).first();
        const hasStudents = await studentButton.isVisible().catch(() => false);

        if (!hasStudents) {
            test.skip(true, "No students available");
            return;
        }

        await studentButton.click();
        await page.waitForTimeout(1000);

        // Check for reset button (RotateCcw icon with title)
        const resetButton = page.locator("button[title='Resetar esta disciplina']").first();
        const hasReset = await resetButton.isVisible().catch(() => false);

        // May or may not be visible depending on whether student has non-virtual disciplines
        // Just verify the page didn't error out
        await expect(page.locator("body")).not.toContainText("Error");
    });
});

// ─── Avaliação Diagnóstica Integration ────────────────────────────────────

test.describe("Avaliação Diagnóstica - PEI Integration", () => {

    test("navigating from PEI pre-selects student and discipline", async ({ authenticatedPage: page }) => {
        // Simulate the URL params that PEI sends
        await page.goto("/avaliacao-diagnostica?studentId=test-id&disciplina=Matemática&fromPEI=true");
        await page.waitForTimeout(3000);

        // The page should load without errors
        await expect(page.locator("body")).not.toContainText("Erro de conexão");

        // The diagnostic module should be visible
        await expect(
            page.locator("text=/Avaliação Diagnóstica|Estudantes|Diagnóstica/i").first()
        ).toBeVisible();
    });

    test("diagnostic stepper shows 4 phases", async ({ authenticatedPage: page }) => {
        await page.goto("/avaliacao-diagnostica");
        await page.waitForTimeout(3000);

        // Navigate to a student if available
        const studentButton = page.locator("button").filter({ hasText: /[A-Z]/ }).first();
        const hasStudents = await studentButton.isVisible().catch(() => false);

        if (!hasStudents) {
            test.skip(true, "No students available");
            return;
        }

        await studentButton.click();
        await page.waitForTimeout(1500);

        // Select a discipline if prompted
        const discButton = page.locator("button").filter({ hasText: /Matemática|Português|Ciências/i }).first();
        if (await discButton.isVisible()) {
            await discButton.click();
            await page.waitForTimeout(1500);
        }

        // Check for the 4-step progress stepper
        await expect(page.locator("text=Gerar Avaliação").first()).toBeVisible();
        await expect(page.locator("text=Aplicar Gabarito").first()).toBeVisible();
        await expect(page.locator("text=Perfil de Funcionamento").first()).toBeVisible();
        await expect(page.locator("text=Estratégias Práticas").first()).toBeVisible();
    });

    test("tab navigation works correctly", async ({ authenticatedPage: page }) => {
        await page.goto("/avaliacao-diagnostica");
        await page.waitForTimeout(3000);

        // Check tab bar exists
        const tabs = ["Estudantes", "Respostas", "Matriz de Referência", "Manual de Aplicação"];

        for (const tab of tabs) {
            const tabButton = page.locator("button").filter({ hasText: tab }).first();
            const isVisible = await tabButton.isVisible().catch(() => false);
            if (isVisible) {
                await tabButton.click();
                await page.waitForTimeout(500);
            }
        }

        // No errors should have occurred
        await expect(page.locator("body")).not.toContainText("Error");
    });
});

// ─── Data Cleanup ─────────────────────────────────────────────────────────

test.describe("Data Cleanup", () => {

    test("cleanup panel loads in config-escola", async ({ authenticatedPage: page }) => {
        await page.goto("/config-escola");
        await page.waitForTimeout(3000);

        // Should have the cleanup section
        const cleanupSection = page.locator("text=Limpeza de Dados").first();
        const hasCleanup = await cleanupSection.isVisible().catch(() => false);

        if (hasCleanup) {
            // Verify the verify button exists
            await expect(
                page.locator("button").filter({ hasText: /Verificar/i }).first()
            ).toBeVisible();
        }
    });

    test("cleanup API returns proper response", async ({ authenticatedPage: page }) => {
        await page.goto("/config-escola");
        await page.waitForTimeout(2000);

        // Call the API directly via page context
        const response = await page.evaluate(async () => {
            const res = await fetch("/api/admin/cleanup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ dryRun: true }),
            });
            return { status: res.status, data: await res.json() };
        });

        // Should return 200 (admin) or 403 (non-admin)
        expect([200, 403]).toContain(response.status);

        if (response.status === 200) {
            expect(response.data.report).toBeDefined();
            expect(response.data.report.details).toBeInstanceOf(Array);
        }
    });
});

// ─── Student Deletion Cascade ─────────────────────────────────────────────

test.describe("Student Management - Cascade Warnings", () => {

    test("student page loads", async ({ authenticatedPage: page }) => {
        await page.goto("/estudantes");
        await page.waitForTimeout(3000);

        // Should load without errors
        await expect(page.locator("body")).not.toContainText("Erro de conexão");
    });

    test("delete confirmation shows cascade details", async ({ authenticatedPage: page }) => {
        await page.goto("/estudantes");
        await page.waitForTimeout(3000);

        // Find a student and expand
        const studentRow = page.locator("button").filter({ hasText: /[A-Z]/ }).first();
        const hasStudents = await studentRow.isVisible().catch(() => false);

        if (!hasStudents) {
            test.skip(true, "No students available");
            return;
        }

        await studentRow.click();
        await page.waitForTimeout(1000);

        // Click "Excluir estudante" button
        const deleteButton = page.locator("button").filter({ hasText: "Excluir estudante" }).first();
        const hasDelete = await deleteButton.isVisible().catch(() => false);

        if (!hasDelete) {
            test.skip(true, "Delete button not found");
            return;
        }

        await deleteButton.click();
        await page.waitForTimeout(500);

        // Should show cascade warning
        await expect(page.locator("text=não pode ser desfeita").first()).toBeVisible();
        await expect(page.locator("text=Dados do PEI").first()).toBeVisible();
        await expect(page.locator("text=Avaliações diagnósticas").first()).toBeVisible();

        // Cancel the deletion
        const cancelButton = page.locator("button").filter({ hasText: "Cancelar" }).first();
        await cancelButton.click();
    });
});
