/**
 * @vitest-environment jsdom
 */

/**
 * Testes de Componente — EmptyState
 *
 * Cobertura:
 * - Renderiza título e descrição
 * - Renderiza sem descrição
 * - Renderiza com ação (botão)
 * - Renderiza com ação (link)
 * - aria-label no botão
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { EmptyState } from "@/components/EmptyState";

describe("EmptyState", () => {
    it("renderiza título", () => {
        render(<EmptyState title="Nenhum registro encontrado" />);
        expect(screen.getByText("Nenhum registro encontrado")).toBeInTheDocument();
    });

    it("renderiza título e descrição", () => {
        render(
            <EmptyState
                title="Sem dados"
                description="Crie seu primeiro registro para começar."
            />
        );
        expect(screen.getByText("Sem dados")).toBeInTheDocument();
        expect(screen.getByText("Crie seu primeiro registro para começar.")).toBeInTheDocument();
    });

    it("renderiza sem descrição (apenas título)", () => {
        const { container } = render(<EmptyState title="Vazio" />);
        const paragraphs = container.querySelectorAll("p");
        expect(paragraphs.length).toBe(1); // Apenas o título
    });

    it("renderiza botão de ação com onClick", () => {
        const mockClick = vi.fn();
        render(
            <EmptyState
                title="Sem registros"
                action={{ label: "Criar primeiro", onClick: mockClick }}
            />
        );

        const button = screen.getByRole("button", { name: "Criar primeiro" });
        expect(button).toBeInTheDocument();

        fireEvent.click(button);
        expect(mockClick).toHaveBeenCalledTimes(1);
    });

    it("renderiza link de ação com href", () => {
        render(
            <EmptyState
                title="Sem planos"
                action={{ label: "Criar plano", href: "/plano-curso/new" }}
            />
        );

        const link = screen.getByText("Criar plano");
        expect(link).toBeInTheDocument();
        expect(link.closest("a")).toHaveAttribute("href", "/plano-curso/new");
    });

    it("tem aria-label no botão de ação", () => {
        render(
            <EmptyState
                title="Vazio"
                action={{ label: "Adicionar item", onClick: () => { } }}
            />
        );

        const button = screen.getByLabelText("Adicionar item");
        expect(button).toBeInTheDocument();
    });
});
