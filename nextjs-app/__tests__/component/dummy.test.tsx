// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

describe("Test JSDOM Environment", () => {
    it("renders a div", () => {
        render(<div data-testid="test-div">Hello JSDOM</div>);
        expect(screen.getByTestId("test-div")).toBeInTheDocument();
    });
});
