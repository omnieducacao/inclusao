// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SegurancaPage from '@/app/seguranca/page';

describe('Página Institucional de Segurança e Transparência', () => {
    it('deve renderizar o título principal (H1) instruindo diretores escolares', () => {
        render(<SegurancaPage />);
        const mainHeading = screen.getByRole('heading', { level: 1, name: /Segurança e Confiança/i });
        expect(mainHeading).toBeInTheDocument();
    });

    it('deve conter os 3 pilares técnicos de infraestrutura apresentados visualmente', () => {
        render(<SegurancaPage />);
        // Confere Renderização Condicional / Estática
        expect(screen.getAllByText(/Proteção de Dados \(LGPD\)/i).length).toBeGreaterThan(0);
        expect(screen.getByText(/Performance Enterprise/i)).toBeInTheDocument();
        expect(screen.getByText(/100% Acessível \(WCAG AAA\)/i)).toBeInTheDocument();

        // Confere se o proxy está citado
        expect(screen.getByText(/Supabase/i)).toBeInTheDocument();
    });

    it('deve ter o link final CTA que retorna para o ecossistema', () => {
        render(<SegurancaPage />);
        const backLink = screen.getByRole('link', { name: /Voltar para a Página Inicial/i });
        expect(backLink).toBeInTheDocument();
        expect(backLink).toHaveAttribute('href', '/landing');
    });
});
