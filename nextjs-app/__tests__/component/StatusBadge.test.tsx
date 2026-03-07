/**
 * @vitest-environment jsdom
 */

/**
 * Testes de Componente — StatusBadge
 *
 * Cobertura:
 * - Renderiza com cada status conhecido
 * - Exibe label customizado
 * - Aplica tamanho sm/md
 * - Ícone de spin para loading
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { StatusBadge } from "@/components/StatusBadge";

describe("StatusBadge", () => {
    it("renderiza status pendente com label padrão", () => {
        render(<StatusBadge status="pendente" />);
        expect(screen.getByText("Pendente")).toBeInTheDocument();
    });

    it("renderiza status concluido", () => {
        render(<StatusBadge status="concluido" />);
        expect(screen.getByText("Concluído")).toBeInTheDocument();
    });

    it("renderiza status em_andamento", () => {
        render(<StatusBadge status="em_andamento" />);
        expect(screen.getByText("Em andamento")).toBeInTheDocument();
    });

    it("renderiza status aprovado", () => {
        render(<StatusBadge status="aprovado" />);
        expect(screen.getByText("Aprovado")).toBeInTheDocument();
    });

    it("renderiza status reprovado", () => {
        render(<StatusBadge status="reprovado" />);
        expect(screen.getByText("Reprovado")).toBeInTheDocument();
    });

    it("renderiza status revisao", () => {
        render(<StatusBadge status="revisao" />);
        expect(screen.getByText("Em revisão")).toBeInTheDocument();
    });

    it("renderiza status rascunho", () => {
        render(<StatusBadge status="rascunho" />);
        expect(screen.getByText("Rascunho")).toBeInTheDocument();
    });

    it("renderiza status gerado", () => {
        render(<StatusBadge status="gerado" />);
        expect(screen.getByText("Gerado")).toBeInTheDocument();
    });

    it("renderiza status devolvido", () => {
        render(<StatusBadge status="devolvido" />);
        expect(screen.getByText("Devolvido")).toBeInTheDocument();
    });

    it("renderiza status desconhecido como fallback", () => {
        render(<StatusBadge status="xyz_unknown" />);
        expect(screen.getByText("Desconhecido")).toBeInTheDocument();
    });

    it("aceita label customizado", () => {
        render(<StatusBadge status="pendente" label="Aguardando revisão" />);
        expect(screen.getByText("Aguardando revisão")).toBeInTheDocument();
        expect(screen.queryByText("Pendente")).not.toBeInTheDocument();
    });

    it("tem role=status para acessibilidade", () => {
        render(<StatusBadge status="concluido" />);
        expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("aplica tamanho sm", () => {
        const { container } = render(<StatusBadge status="pendente" size="sm" />);
        const span = container.firstChild as HTMLElement;
        expect(span.style.fontSize).toBe("10px");
    });

    it("aplica tamanho md (default)", () => {
        const { container } = render(<StatusBadge status="pendente" />);
        const span = container.firstChild as HTMLElement;
        expect(span.style.fontSize).toBe("11px");
    });
});
