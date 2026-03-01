import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "../components/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/Card";
import { Input } from "../components/Input";
import { Separator } from "../components/Separator";
import { Progress } from "../components/Progress";
import { Toggle } from "../components/Toggle";
import { Checkbox } from "../components/Checkbox";

describe("Badge", () => {
    it("renders with text", () => {
        render(<Badge>Active</Badge>);
        expect(screen.getByText("Active")).toBeInTheDocument();
    });

    it("renders dot indicator", () => {
        render(<Badge dot>Status</Badge>);
        expect(screen.getByText("Status")).toBeInTheDocument();
    });
});

describe("Card", () => {
    it("renders with header and content", () => {
        render(
            <Card>
                <CardHeader>
                    <CardTitle>Test Card</CardTitle>
                    <CardDescription>Description</CardDescription>
                </CardHeader>
                <CardContent>Content here</CardContent>
            </Card>
        );
        expect(screen.getByText("Test Card")).toBeInTheDocument();
        expect(screen.getByText("Description")).toBeInTheDocument();
        expect(screen.getByText("Content here")).toBeInTheDocument();
    });
});

describe("Input", () => {
    it("renders with label", () => {
        render(<Input label="Nome" placeholder="Digite seu nome" />);
        expect(screen.getByLabelText("Nome")).toBeInTheDocument();
    });

    it("shows error message", () => {
        render(<Input label="Email" error="E-mail inválido" />);
        expect(screen.getByText("E-mail inválido")).toBeInTheDocument();
    });
});

describe("Separator", () => {
    it("renders horizontal separator", () => {
        render(<Separator data-testid="sep" />);
        const sep = screen.getByTestId("sep");
        expect(sep).toHaveAttribute("role", "none");
    });

    it("renders as semantic separator", () => {
        render(<Separator decorative={false} orientation="horizontal" data-testid="sep" />);
        const sep = screen.getByTestId("sep");
        expect(sep).toHaveAttribute("role", "separator");
    });
});

describe("Progress", () => {
    it("renders with role progressbar", () => {
        render(<Progress value={65} />);
        const bar = screen.getByRole("progressbar");
        expect(bar).toHaveAttribute("aria-valuenow", "65");
    });
});

describe("Toggle", () => {
    it("renders with role switch", () => {
        render(<Toggle label="Dark mode" />);
        const toggle = screen.getByRole("switch");
        expect(toggle).toBeInTheDocument();
    });
});

describe("Checkbox", () => {
    it("renders with label", () => {
        render(<Checkbox label="Aceito os termos" />);
        expect(screen.getByLabelText("Aceito os termos")).toBeInTheDocument();
    });
});
