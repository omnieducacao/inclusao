/**
 * @vitest-environment jsdom
 */

/**
 * Testes de Componente — HubResultPanel
 *
 * Cobertura:
 * - Mostra loading state
 * - Mostra resultado com texto
 * - Botão copiar funciona
 * - Botão fechar funciona
 * - aria-labels presentes
 * - Retorna null sem resultado
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { HubResultPanel } from "@/components/HubResultPanel";

// Mock dos sub-componentes para isolar o teste
vi.mock("@/components/FormattedTextDisplay", () => ({
    FormattedTextDisplay: ({ texto }: { texto: string }) => <div data-testid="formatted">{texto}</div>,
}));

vi.mock("@/components/PdfDownloadButton", () => ({
    PdfDownloadButton: () => <button>PDF</button>,
}));

vi.mock("@/components/SalvarNoPlanoButton", () => ({
    SalvarNoPlanoButton: () => <button>Salvar</button>,
}));

describe("HubResultPanel", () => {
    it("retorna null sem resultado e sem generating", () => {
        const { container } = render(
            <HubResultPanel result="" generating={false} />
        );
        expect(container.innerHTML).toBe("");
    });

    it("mostra loading state quando generating", () => {
        render(<HubResultPanel result="" generating={true} />);
        expect(screen.getByRole("status")).toBeInTheDocument();
        expect(screen.getByText("Gerando com IA...")).toBeInTheDocument();
    });

    it("mostra resultado com texto formatado", () => {
        render(<HubResultPanel result="Resultado da IA aqui" generating={false} />);
        expect(screen.getByTestId("formatted")).toHaveTextContent("Resultado da IA aqui");
    });

    it("mostra nome do estudante no header", () => {
        render(
            <HubResultPanel result="Texto" generating={false} studentName="João" />
        );
        expect(screen.getByText(/João/)).toBeInTheDocument();
    });

    it("botão copiar tem aria-label", () => {
        render(<HubResultPanel result="Texto copiar" generating={false} />);
        expect(screen.getByLabelText("Copiar resultado")).toBeInTheDocument();
    });

    it("botão regenerar aparece e tem aria-label", () => {
        const onRegenerate = vi.fn();
        render(
            <HubResultPanel result="Texto" generating={false} onRegenerate={onRegenerate} />
        );
        const btn = screen.getByLabelText("Regenerar resultado");
        expect(btn).toBeInTheDocument();

        fireEvent.click(btn);
        expect(onRegenerate).toHaveBeenCalledTimes(1);
    });

    it("botão fechar aparece e tem aria-label", () => {
        const onClose = vi.fn();
        render(
            <HubResultPanel result="Texto" generating={false} onClose={onClose} />
        );
        const btn = screen.getByLabelText("Fechar resultado");
        expect(btn).toBeInTheDocument();

        fireEvent.click(btn);
        expect(onClose).toHaveBeenCalledTimes(1);
    });
});
