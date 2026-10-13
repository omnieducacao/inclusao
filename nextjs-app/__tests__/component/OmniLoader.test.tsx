// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { OmniLoader } from "@/components/OmniLoader";

// Onda 22: o OmniLoader só encaminha para o carregamento do design system (símbolo da Omnisfera).
describe("OmniLoader", () => {
    it("inline com texto: símbolo + texto, anunciado ao leitor de tela", () => {
        render(<OmniLoader engine="blue" message="Carregando o plano…" />);
        expect(screen.getByText("Carregando o plano…")).toBeInTheDocument();
        expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("inline sem texto é decorativo (dentro de botão)", () => {
        const { container } = render(<OmniLoader size={18} />);
        expect(screen.queryByRole("status")).toBeNull();
        expect(container.querySelector(".omni-carregando-linha svg")).not.toBeNull();
    });

    it("card vira o carregamento de seção, sem nome de motor de IA", () => {
        const { container } = render(<OmniLoader variant="card" engine="red" />);
        expect(container.querySelector(".omni-carregando--secao")).not.toBeNull();
        expect(screen.queryByText(/OmniRed/i)).toBeNull();
        expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("overlay vira a tela de carregamento da página", () => {
        const { container } = render(<OmniLoader variant="overlay" module="pei" />);
        expect(container.querySelector(".omni-carregando--pagina")).not.toBeNull();
        expect(screen.getByText(/barreiras e potencialidades/i)).toBeInTheDocument();
    });
});
