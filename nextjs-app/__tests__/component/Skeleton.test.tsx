/**
 * @vitest-environment jsdom
 */

/**
 * Testes de Componente — Skeleton
 *
 * Cobertura:
 * - Skeleton base renderiza com dimensões
 * - SkeletonText renderiza N linhas
 * - SkeletonCard renderiza com avatar
 * - SkeletonList renderiza vários items
 * - aria-hidden para acessibilidade
 * - aria-live no SkeletonList
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import {
    Skeleton,
    SkeletonText,
    SkeletonCard,
    SkeletonList,
    SkeletonTableRow,
} from "@/components/Skeleton";

describe("Skeleton", () => {
    it("renderiza com dimensões padrão", () => {
        const { container } = render(<Skeleton />);
        const el = container.firstChild as HTMLElement;
        expect(el).toBeInTheDocument();
        expect(el.style.width).toBe("100%");
        expect(el.style.height).toBe("16px");
    });

    it("aceita dimensões customizadas", () => {
        const { container } = render(<Skeleton width={200} height={40} />);
        const el = container.firstChild as HTMLElement;
        expect(el.style.width).toBe("200px");
        expect(el.style.height).toBe("40px");
    });

    it("aceita dimensões em string", () => {
        const { container } = render(<Skeleton width="50%" height="2rem" />);
        const el = container.firstChild as HTMLElement;
        expect(el.style.width).toBe("50%");
        expect(el.style.height).toBe("2rem");
    });

    it("tem aria-hidden=true", () => {
        const { container } = render(<Skeleton />);
        expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
    });

    it("tem animação shimmer", () => {
        const { container } = render(<Skeleton />);
        const el = container.firstChild as HTMLElement;
        expect(el.style.animation).toContain("omni-shimmer");
    });
});

describe("SkeletonText", () => {
    it("renderiza 3 linhas por padrão", () => {
        const { container } = render(<SkeletonText />);
        const skeletons = container.querySelectorAll(".omni-skeleton");
        expect(skeletons.length).toBe(3);
    });

    it("renderiza N linhas customizadas", () => {
        const { container } = render(<SkeletonText lines={5} />);
        const skeletons = container.querySelectorAll(".omni-skeleton");
        expect(skeletons.length).toBe(5);
    });

    it("última linha tem largura reduzida", () => {
        const { container } = render(<SkeletonText lines={2} lastLineWidth="40%" />);
        const skeletons = container.querySelectorAll(".omni-skeleton");
        expect((skeletons[1] as HTMLElement).style.width).toBe("40%");
    });
});

describe("SkeletonCard", () => {
    it("renderiza card placeholder", () => {
        const { container } = render(<SkeletonCard />);
        expect(container.firstChild).toBeInTheDocument();
        expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
    });

    it("mostra avatar por padrão", () => {
        const { container } = render(<SkeletonCard showAvatar={true} />);
        // Avatar tem borderRadius 999
        const skeletons = container.querySelectorAll(".omni-skeleton");
        expect(skeletons.length).toBeGreaterThan(3); // avatar + header + text lines
    });
});

describe("SkeletonTableRow", () => {
    it("renderiza colunas", () => {
        const { container } = render(<SkeletonTableRow columns={3} />);
        const skeletons = container.querySelectorAll(".omni-skeleton");
        expect(skeletons.length).toBe(3);
    });
});

describe("SkeletonList", () => {
    it("renderiza com role=status e aria-live", () => {
        render(<SkeletonList count={2} />);
        const list = screen.getByRole("status");
        expect(list).toHaveAttribute("aria-live", "polite");
    });

    it("renderiza N cards", () => {
        const { container } = render(<SkeletonList count={3} variant="card" />);
        const cards = container.querySelectorAll("[aria-hidden='true']");
        expect(cards.length).toBeGreaterThanOrEqual(3);
    });

    it("renderiza rows", () => {
        const { container } = render(<SkeletonList count={4} variant="row" />);
        const inner = container.querySelectorAll(".omni-skeleton");
        expect(inner.length).toBeGreaterThanOrEqual(4); // At least one skeleton per row
    });
});
