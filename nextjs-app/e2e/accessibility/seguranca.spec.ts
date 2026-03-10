import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Acessibilidade Institucional - Segurança', () => {
    test.use({ viewport: { width: 1280, height: 800 } });

    test('Página pública /seguranca não deve possuir violações WCAG de Contraste ou ARIA', async ({ page }) => {
        // Servidor já estava rodando na porta 3001 da bateria anterior do usuário
        await page.goto('http://127.0.0.1:3001/seguranca');
        await page.waitForTimeout(1000); // Aguarda layout shift e hidratação

        const results = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
            .analyze();

        const criticalViolations = results.violations.filter(
            v => v.impact === 'critical' || v.impact === 'serious'
        );

        // Se o Lighthouse e nossa auditoria de cores bateu 100/100, deve ser validado aqui.
        expect(criticalViolations).toEqual([]);
    });
});
