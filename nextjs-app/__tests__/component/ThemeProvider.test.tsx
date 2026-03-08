// @vitest-environment jsdom
import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ThemeProvider, useTheme } from "@/components/ThemeProvider";

// Dummy component consumindo o hook para testes
const TestComponent = () => {
    const {
        theme, toggleTheme,
        dyslexiaFont, toggleDyslexiaFont,
        colorBlindMode, setColorBlindMode
    } = useTheme();

    return (
        <div>
            <span data-testid="theme-val">{theme}</span>
            <span data-testid="dyslexia-val">{String(dyslexiaFont)}</span>
            <span data-testid="cb-val">{colorBlindMode}</span>

            <button onClick={toggleTheme}>Toggle Theme</button>
            <button onClick={toggleDyslexiaFont}>Toggle Dyslexia</button>
            <button onClick={() => setColorBlindMode("protanopia")}>Set Protanopia</button>
        </div>
    );
};

describe("ThemeProvider", () => {
    beforeEach(() => {
        // Limpar LocalStorage e DOM classList
        localStorage.clear();
        document.documentElement.className = "";
        document.documentElement.removeAttribute("data-theme");

        // Mock window.matchMedia behavior
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: vi.fn().mockImplementation((query) => ({
                matches: false,
                media: query,
                onchange: null,
                addListener: vi.fn(), // deprecated
                removeListener: vi.fn(), // deprecated
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                dispatchEvent: vi.fn(),
            })),
        });
    });

    it("inicializa consumindo os valores Default (notebook, false, none)", async () => {
        render(
            <ThemeProvider>
                <TestComponent />
            </ThemeProvider>
        );

        // O render possui um timeout de hidratação no useEffect
        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 10));
        });

        expect(screen.getByTestId("theme-val").textContent).toBe("notebook");
        expect(screen.getByTestId("dyslexia-val").textContent).toBe("false");
        expect(screen.getByTestId("cb-val").textContent).toBe("none");
    });

    it("aplica a classe de dislexia no <html> e salva no LocalStorage ao alternar", async () => {
        render(
            <ThemeProvider>
                <TestComponent />
            </ThemeProvider>
        );

        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 10));
        });

        // Simula click do usuario no botão
        await act(async () => {
            screen.getByText("Toggle Dyslexia").click();
        });

        // Verificações
        expect(screen.getByTestId("dyslexia-val").textContent).toBe("true");
        expect(document.documentElement.classList.contains("dyslexia-font")).toBe(true);
        expect(localStorage.getItem("omnisfera-dyslexia")).toBe("true");
    });

    it("aplica classe de daltonismo correta e remove as velhas", async () => {
        render(
            <ThemeProvider>
                <TestComponent />
            </ThemeProvider>
        );

        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 10));
        });

        // Ativa um modo daltônico
        await act(async () => {
            screen.getByText("Set Protanopia").click();
        });

        expect(screen.getByTestId("cb-val").textContent).toBe("protanopia");
        expect(document.documentElement.classList.contains("cb-protanopia")).toBe(true);
        expect(localStorage.getItem("omnisfera-colorblind")).toBe("protanopia");
    });
});
