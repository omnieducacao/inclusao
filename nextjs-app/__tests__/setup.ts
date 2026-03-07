import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mocks globais para o ambiente jsdom
if (typeof window !== "undefined") {
    // Mock para matchMedia (usado em breakpoints, temas, dnd)
    Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: vi.fn().mockImplementation((query) => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: vi.fn(), // Deprecated
            removeListener: vi.fn(), // Deprecated
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
        })),
    });

    // Mock IntersectionObserver
    class IntersectionObserverMock {
        observe = vi.fn();
        disconnect = vi.fn();
        unobserve = vi.fn();
    }
    Object.defineProperty(window, "IntersectionObserver", {
        writable: true,
        configurable: true,
        value: IntersectionObserverMock,
    });

    HTMLCanvasElement.prototype.getContext = function () {
        return {
            fillStyle: "",
            fillRect: function () { },
            clearRect: function () { },
            getImageData: function () { return { data: new Uint8ClampedArray(0) }; },
            putImageData: function () { },
            createImageData: function () { },
            setTransform: function () { },
            drawImage: function () { },
            save: function () { },
            fillText: function () { },
            restore: function () { },
            beginPath: function () { },
            moveTo: function () { },
            lineTo: function () { },
            closePath: function () { },
            stroke: function () { },
            translate: function () { },
            scale: function () { },
            rotate: function () { },
            arc: function () { },
            fill: function () { },
            measureText: function () { return { width: 0 }; },
            transform: function () { },
            rect: function () { },
            clip: function () { },
        };
    } as any;
}
