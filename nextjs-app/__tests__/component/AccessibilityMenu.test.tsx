// @vitest-environment jsdom
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AccessibilityMenu } from "@/components/AccessibilityMenu";
import * as ThemeProviderModule from "@/components/ThemeProvider";

// Mocks para os ícones
vi.mock("lucide-react", () => ({
    Settings2: () => <div data-testid="icon-settings" />,
    Eye: () => <div data-testid="icon-eye" />,
    Type: () => <div data-testid="icon-type" />,
    Droplet: () => <div data-testid="icon-droplet" />,
    Moon: () => <div data-testid="icon-moon" />,
    Sun: () => <div data-testid="icon-sun" />,
    Check: () => <div data-testid="icon-check" />,
    NotebookPen: () => <div data-testid="icon-notebook" />,
}));

describe("AccessibilityMenu", () => {
    const mockToggleTheme = vi.fn();
    const mockSetTheme = vi.fn();
    const mockSetPreferencia = vi.fn();
    const mockToggleHighContrast = vi.fn();
    const mockToggleDyslexiaFont = vi.fn();
    const mockSetColorBlindMode = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();

        // Espionamos o useTheme do Provider nativo
        vi.spyOn(ThemeProviderModule, "useTheme").mockReturnValue({
            theme: "light",
            toggleTheme: mockToggleTheme,
            setTheme: mockSetTheme,
            preferencia: "auto",
            setPreferencia: mockSetPreferencia,
            isDark: false,
            highContrast: false,
            toggleHighContrast: mockToggleHighContrast,
            dyslexiaFont: false,
            toggleDyslexiaFont: mockToggleDyslexiaFont,
            colorBlindMode: "none",
            setColorBlindMode: mockSetColorBlindMode,
        });
    });

    it("renderiza o botão principal recolhido", () => {
        render(<AccessibilityMenu />);
        const btn = screen.getByRole("button", { name: /Menu de Acessibilidade e Aparência/i });
        expect(btn).toBeInTheDocument();
        expect(screen.queryByText(/Aparência e Acessibilidade/i)).not.toBeInTheDocument();
    });

    it("abre o dropdown e revela os controles ao ser clicado", async () => {
        render(<AccessibilityMenu />);

        const triggerBtn = screen.getByRole("button", { name: /Menu de Acessibilidade e Aparência/i });
        fireEvent.click(triggerBtn);

        await waitFor(() => {
            expect(screen.getByText(/Aparência e Acessibilidade/i)).toBeInTheDocument();
        });

        // Toggle Buttons text
        // Tema: o padrão segue o aparelho; a pessoa pode fixar Claro, Caderno ou Escuro
        expect(screen.getByLabelText("Automático")).toBeChecked();
        expect(screen.getByLabelText("Claro")).not.toBeChecked();
        expect(screen.getByLabelText("Caderno")).not.toBeChecked();
        expect(screen.getByLabelText("Escuro")).not.toBeChecked();
        expect(screen.getByText(/Alto Contraste/i)).toBeInTheDocument();
        expect(screen.getByText(/Fonte para leitura/i)).toBeInTheDocument();

        // Color Blind specific modes
        expect(screen.getByText(/Protanopia/i)).toBeInTheDocument();
        expect(screen.getByText(/Deutera\./i)).toBeInTheDocument();
        expect(screen.getByText(/Tritanopia/i)).toBeInTheDocument();
    });

    it("invoca the toggle functions de Acessibilidade corretamente", async () => {
        render(<AccessibilityMenu />);

        // Open the menu
        fireEvent.click(screen.getByRole("button", { name: /Menu de Acessibilidade e Aparência/i }));

        await waitFor(() => {
            expect(screen.getByText(/Alto Contraste/i)).toBeInTheDocument();
        });

        // Acha os checkboxes invisíveis pelo texto ou simulando o clique no label
        // Como o input usa `sr-only` e o clique ocorre no label, vamos pegar o container pai.
        const hcLabel = screen.getByText(/Alto Contraste/i).closest("label");
        const dfLabel = screen.getByText(/Fonte para leitura/i).closest("label");

        // Triggers the simulated toggles
        expect(hcLabel).not.toBeNull();
        expect(dfLabel).not.toBeNull();

        fireEvent.click(hcLabel!);
        expect(mockToggleHighContrast).toHaveBeenCalledTimes(1);

        fireEvent.click(dfLabel!);
        expect(mockToggleDyslexiaFont).toHaveBeenCalledTimes(1);

        // Click no modo Daltônico
        const btnProtanopia = screen.getByText(/Protanopia/i).closest("button");
        fireEvent.click(btnProtanopia!);

        expect(mockSetColorBlindMode).toHaveBeenCalledWith("protanopia");

        // Escolher o Caderno fixa a preferência
        fireEvent.click(screen.getByLabelText("Caderno"));
        expect(mockSetPreferencia).toHaveBeenCalledWith("notebook");
    });
});
