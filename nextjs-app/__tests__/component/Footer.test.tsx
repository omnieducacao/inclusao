// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Footer } from '@/components/Footer';

describe('Footer Component - Transparência de Qualidade', () => {
    it('deve renderizar os badges de selo de LGPD, WCAG AAA e Alta Performance', () => {
        render(<Footer />);
        expect(screen.getByText(/Adequado LGPD/i)).toBeInTheDocument();
        expect(screen.getByText(/Acessível WCAG/i)).toBeInTheDocument();
        expect(screen.getByText(/100\/100 Perf/i)).toBeInTheDocument();
    });

    it('deve ter o link persistente para a página institucional de segurança', () => {
        render(<Footer />);
        const securityLink = screen.getByRole('link', { name: /Segurança e Transparência/i });
        expect(securityLink).toBeInTheDocument();
        expect(securityLink).toHaveAttribute('href', '/seguranca');
    });
});
