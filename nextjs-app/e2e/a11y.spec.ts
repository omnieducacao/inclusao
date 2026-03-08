import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y, getViolations } from 'axe-playwright';
import AxeBuilder from '@axe-core/playwright';

// Rotas primárias do Dashboard
const ROUTES_TO_TEST = [
    '/login',
    '/hub',
    '/avaliacao-diagnostica',
    '/estudantes'
];

test.describe('Validação Omninclusiva (WCAG AAA)', () => {

    test.beforeEach(async ({ page }) => {
        // Fazer login (se não for a página de login)
        // Para simplificar a varredura, interceptaremos o estado de auth ou logaremos normalmente
        await page.goto('/login');
        await page.fill('input[name="email"]', 'prof@teste.com');
        await page.fill('input[name="password"]', 'senha123');
        await page.click('button[type="submit"]');
        await page.waitForURL('/hub');
    });

    for (const route of ROUTES_TO_TEST) {
        if (route === '/login') continue; // Já testamos isoladamente por fora

        test(`Auditoria Axe-Core na Rota: ${route}`, async ({ page }) => {
            await page.goto(route);

            // Aguardar hidratação e montagem completa do CSS/Lottie
            await page.waitForTimeout(2000);

            const accessibilityScanResults = await new AxeBuilder({ page })
                .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag2aaa'])
                .analyze();

            if (accessibilityScanResults.violations.length > 0) {
                console.error(`Violações A11y encontradas em ${route}:`);
                accessibilityScanResults.violations.forEach(v => {
                    console.error(`Regra: ${v.id} - ${v.description}`);
                    v.nodes.forEach(node => console.error(`  - HTML: ${node.html}`));
                });
            }

            // Assert para travar a Pipeline se houver violações
            expect(accessibilityScanResults.violations).toEqual([]);
        });
    }

    test('Teste de Navegação por Teclado cego (Tab Focus Trap)', async ({ page }) => {
        await page.goto('/hub');
        await page.waitForTimeout(2000);

        // Emular o leitor de tela (NVDA) pressionando a tecla 'Tab' progressivamente
        await page.keyboard.press('Tab');
        await page.keyboard.press('Tab');

        // Obter o elemento em Foco Ativo e garantir que é interagível (Não quebrou a Tree)
        const focusedElementTag = await page.evaluate(() => document.activeElement?.tagName);
        expect(['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'].includes(focusedElementTag || '')).toBeTruthy();
    });
});
