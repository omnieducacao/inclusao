// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { OmniLoader } from "@/components/OmniLoader";

describe("OmniLoader", () => {
    it("renderiza variant inline por padrão", () => {
        render(<OmniLoader engine="blue" message="Carregando azul..." />);
        expect(screen.getByText("Carregando azul...")).toBeInTheDocument();
        // SVG is rendered implicitly, we just check role
        expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("renderiza variant card com o label do motor de IA", () => {
        render(<OmniLoader variant="card" engine="red" />);
        // "OmniRed processando" ou similar de acordo com a ENGINE_META
        expect(screen.getByText(/OmniRed processando/i)).toBeInTheDocument();
    });

    it("renderiza variant overlay", () => {
        render(<OmniLoader variant="overlay" engine="green" />);
        // "OmniGreen" name appears boldly
        expect(screen.getByText("OmniGreen")).toBeInTheDocument();
    });
});
