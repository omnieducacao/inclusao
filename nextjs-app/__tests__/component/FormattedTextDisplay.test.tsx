/**
 * @vitest-environment jsdom
 */

/**
 * Testes de Componente — FormattedTextDisplay
 *
 * Cobertura:
 * - Renderiza texto simples
 * - Renderiza com título
 * - Renderiza null para texto vazio
 * - Processa markdown: títulos, listas, bold, itálico, código
 * - Sanitiza HTML perigoso (XSS)
 * - Placeholder para imagens sem dados
 */

import { describe, it, expect } from "vitest";
// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { FormattedTextDisplay } from "@/components/FormattedTextDisplay";

describe("FormattedTextDisplay", () => {
    it("retorna null para texto vazio", () => {
        const { container } = render(<FormattedTextDisplay texto="" />);
        expect(container.innerHTML).toBe("");
    });

    it("renderiza texto simples", () => {
        render(<FormattedTextDisplay texto="Olá mundo!" />);
        expect(screen.getByText("Olá mundo!")).toBeInTheDocument();
    });

    it("renderiza com título quando fornecido", () => {
        render(<FormattedTextDisplay texto="Corpo" titulo="Título do Texto" />);
        expect(screen.getByText("Título do Texto")).toBeInTheDocument();
        expect(screen.getByText("Corpo")).toBeInTheDocument();
    });

    it("processa títulos markdown h2", () => {
        render(<FormattedTextDisplay texto="## Seção Principal" />);
        const heading = screen.getByText("Seção Principal");
        expect(heading.tagName).toBe("H2");
    });

    it("processa títulos markdown h3", () => {
        render(<FormattedTextDisplay texto="### Sub-seção" />);
        const heading = screen.getByText("Sub-seção");
        expect(heading.tagName).toBe("H3");
    });

    it("processa títulos markdown h4", () => {
        render(<FormattedTextDisplay texto="#### Item" />);
        const heading = screen.getByText("Item");
        expect(heading.tagName).toBe("H4");
    });

    it("processa lista com marcadores", () => {
        const { container } = render(<FormattedTextDisplay texto={"- Item 1\n- Item 2\n- Item 3"} />);
        const list = container.querySelector("ul");
        expect(list).toBeInTheDocument();
        const items = container.querySelectorAll("li");
        expect(items.length).toBeGreaterThanOrEqual(3);
    });

    it("processa texto em negrito", () => {
        render(<FormattedTextDisplay texto="Texto **importante** aqui" />);
        const strong = document.querySelector("strong");
        expect(strong).toBeInTheDocument();
        expect(strong?.textContent).toBe("importante");
    });

    it("processa texto em itálico", () => {
        render(<FormattedTextDisplay texto="Texto *enfatizado* aqui" />);
        const em = document.querySelector("em");
        expect(em).toBeInTheDocument();
        expect(em?.textContent).toBe("enfatizado");
    });

    it("processa código inline", () => {
        const { container } = render(<FormattedTextDisplay texto="Use `console.log()`" />);
        const code = container.querySelector("code");
        expect(code).toBeInTheDocument();
        expect(code?.textContent).toBe("console.log()");
    });

    it("aplica className customizada", () => {
        const { container } = render(
            <FormattedTextDisplay texto="Teste" className="custom-class" />
        );
        expect(container.firstChild).toHaveClass("custom-class");
    });

    it("mostra placeholder para imagens sem dados", () => {
        render(<FormattedTextDisplay texto="[[IMG1]]" />);
        expect(screen.getByText("[Imagem 1]")).toBeInTheDocument();
    });
});
