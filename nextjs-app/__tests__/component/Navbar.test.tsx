// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Navbar } from "@/components/Navbar";
import { AILoadingProvider } from "@/hooks/useAILoading";

// Mocks Essenciais para evitar crash
vi.mock("next/navigation", () => ({
    usePathname: () => "/estudantes",
    useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() })
}));

vi.mock("next/image", () => ({
    default: (props: any) => <img {...props} alt={props.alt || "mocked-image"} />
}));

vi.mock("@/components/ThemeProvider", () => ({
    useTheme: () => ({ theme: "light", setTheme: vi.fn(), customTheme: null }),
    ThemeToggle: () => <button>Toggle Theme</button>,
}));

vi.mock("@/components/NotificationBell", () => ({
    NotificationBell: () => <div>Bell Mock</div>
}));

vi.mock("@/components/LottieIcon", () => ({
    LottieIcon: ({ animationKey }: { animationKey: string }) => <div data-testid="lottie-mock">{animationKey}</div>
}));

vi.mock("phosphor-react", () => ({
    FileText: () => <div data-testid="mock-icon" />,
    PuzzlePiece: () => <div data-testid="mock-icon" />,
    BookOpen: () => <div data-testid="mock-icon" />,
    Exam: () => <div data-testid="mock-icon" />,
    ChartLineUp: () => <div data-testid="mock-icon" />,
    BookBookmark: () => <div data-testid="mock-icon" />,
    RocketLaunch: () => <div data-testid="mock-icon" />,
    ClipboardText: () => <div data-testid="mock-icon" />,
    UsersFour: () => <div data-testid="mock-icon" />,
    Gear: () => <div data-testid="mock-icon" />,
    UsersThree: () => <div data-testid="mock-icon" />,
    ShieldCheckered: () => <div data-testid="mock-icon" />,
    SignOut: () => <div data-testid="mock-icon" />,
    House: () => <div data-testid="mock-icon" />,
    Sparkle: () => <div data-testid="mock-icon" />,
    Brain: () => <div data-testid="mock-icon" />,
}));

import { waitFor } from "@testing-library/react";

describe("Navbar", () => {
    it("renderiza corretamente com sessão válida exibindo o nome do usuário", async () => {
        const mockSession = {
            workspace_id: "ws-123",
            workspace_name: "Escola Integral",
            usuario_nome: "Prof. Alberto",
            user_role: "member",
            member: {
                can_estudantes: true,
                can_pei: true,
            }
        } as any;

        render(
            <AILoadingProvider>
                <Navbar session={mockSession} />
            </AILoadingProvider>
        );

        // O nome do Workspace e Usuário aparecem na Navbar (async render por conta do isMounted)
        const workspaces = await screen.findAllByText(/Escola Integral/i, {}, { timeout: 4000 });
        expect(workspaces.length).toBeGreaterThan(0);

        const nomes = screen.getAllByText(/Prof. Alberto/i);
        expect(nomes.length).toBeGreaterThan(0);
    });

    it("renderiza os links permitidos na sessão", async () => {
        const mockSession = {
            workspace_id: "ws-123",
            workspace_name: "Escola",
            usuario_nome: "Maria",
            user_role: "member",
            member: {
                can_pei: true,
                can_hub: true,
            }
        } as any;

        render(
            <AILoadingProvider>
                <Navbar session={mockSession} />
            </AILoadingProvider>
        );

        // Links (Renderização assíncrona da Nav)
        const peiLinks = await screen.findAllByText(/PEI/i, {}, { timeout: 4000 });
        expect(peiLinks.length).toBeGreaterThan(0);

        const hubLinks = screen.getAllByText(/Hub/i);
        expect(hubLinks.length).toBeGreaterThan(0);

        expect(screen.queryByText(/PAEE/i)).not.toBeInTheDocument();
    });
});
