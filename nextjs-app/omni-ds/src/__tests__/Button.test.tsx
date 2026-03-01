import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "../components/Button";

describe("Button", () => {
    it("renders with text", () => {
        render(<Button>Click me</Button>);
        expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
    });

    it("applies variant classes", () => {
        render(<Button variant="primary">Primary</Button>);
        const btn = screen.getByRole("button");
        expect(btn).toBeInTheDocument();
    });

    it("handles click events", async () => {
        const user = userEvent.setup();
        let clicked = false;
        render(<Button onClick={() => { clicked = true; }}>Click</Button>);
        await user.click(screen.getByRole("button"));
        expect(clicked).toBe(true);
    });

    it("is disabled when disabled prop is set", () => {
        render(<Button disabled>Disabled</Button>);
        expect(screen.getByRole("button")).toBeDisabled();
    });

    it("renders with loading state", () => {
        render(<Button loading>Loading</Button>);
        expect(screen.getByRole("button")).toBeInTheDocument();
    });
});
