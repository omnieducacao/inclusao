import { test, expect } from './helpers/auth';
import AxeBuilder from '@axe-core/playwright';

/**
 * E2E Accessibility Test Suite (WCAG AA/AAA)
 *
 * Uses @axe-core/playwright for automated accessibility audits.
 * Tests key routes for WCAG violations.
 *
 * Run: npx playwright test e2e/a11y.spec.ts
 */

// Rotas primárias do Dashboard
const ROUTES_TO_TEST = [
    '/login',
    '/hub',
    '/avaliacao-diagnostica',
    '/estudantes'
];

test.describe('Validação Omninclusiva (WCAG AA)', () => {

    // Login page (no auth required)
    test('Login page passes WCAG AA audit', async ({ page }) => {
        await page.goto('/login');
        await page.waitForLoadState('networkidle');

        const results = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
            .analyze();

        if (results.violations.length > 0) {
            console.error('Violações A11y no /login:');
            results.violations.forEach(v => {
                console.error(`  [${v.impact}] ${v.id}: ${v.description}`);
                v.nodes.forEach(node => console.error(`    → ${node.html.slice(0, 120)}`));
            });
        }

        // Allow minor violations but flag critical/serious
        const criticalViolations = results.violations.filter(
            v => v.impact === 'critical' || v.impact === 'serious'
        );
        expect(criticalViolations).toEqual([]);
    });

    // Authenticated routes
    for (const route of ROUTES_TO_TEST) {
        if (route === '/login') continue;

        test(`Auditoria Axe na Rota: ${route}`, async ({ authenticatedPage: page }) => {
            await page.goto(route);
            await page.waitForTimeout(3000);

            const results = await new AxeBuilder({ page })
                .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
                .analyze();

            if (results.violations.length > 0) {
                console.error(`Violações A11y em ${route}:`);
                results.violations.forEach(v => {
                    console.error(`  [${v.impact}] ${v.id}: ${v.description}`);
                    v.nodes.slice(0, 3).forEach(node =>
                        console.error(`    → ${node.html.slice(0, 120)}`)
                    );
                });
            }

            const criticalViolations = results.violations.filter(
                v => v.impact === 'critical' || v.impact === 'serious'
            );
            expect(criticalViolations).toEqual([]);
        });
    }

    test('Tab focus reaches interactive elements', async ({ authenticatedPage: page }) => {
        await page.goto('/hub');
        await page.waitForTimeout(3000);

        // Tab twice to skip the skip-link
        await page.keyboard.press('Tab');
        await page.keyboard.press('Tab');

        const focusedTag = await page.evaluate(() => document.activeElement?.tagName);
        expect(['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA']).toContain(focusedTag);
    });

    test('Skip-link is present and functional', async ({ page }) => {
        await page.goto('/login');
        await page.waitForLoadState('networkidle');

        const skipLink = page.locator('.omni-skip-link');
        await expect(skipLink).toHaveCount(1);

        // Focus the skip link
        await page.keyboard.press('Tab');
        const focused = await page.evaluate(() => document.activeElement?.className);
        expect(focused).toContain('omni-skip-link');
    });
});
