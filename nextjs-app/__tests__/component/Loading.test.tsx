/**
 * @vitest-environment jsdom
 */

/**
 * Testes de Componente — Loading
 *
 * Cobertura:
 * - Renderiza com role=status
 * - Tem aria-live=polite
 * - Mostra mensagem de carregamento
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { Loading } from "@/components/Loading";

describe("Loading", () => {
    it("renderiza com role=status", () => {
        render(<Loading />);
        expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("tem aria-live=polite", () => {
        render(<Loading />);
        const el = screen.getByRole("status");
        expect(el).toHaveAttribute("aria-live", "polite");
    });

    it("mostra texto de carregamento", () => {
        render(<Loading />);
        expect(screen.getByText(/carregando/i)).toBeInTheDocument();
    });
});
