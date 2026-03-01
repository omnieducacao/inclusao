import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import dts from "vite-plugin-dts";
import { resolve } from "path";

export default defineConfig(({ mode }) => {
    // Dev mode: serve the docs app for preview
    if (mode === "development") {
        return {
            plugins: [react(), tailwindcss()],
            root: "docs",
            resolve: {
                alias: { "@": resolve(__dirname, "src") },
            },
            optimizeDeps: {
                exclude: ["lottie-react", "lottie-web"],
            },
        };
    }

    // Production: build library
    return {
        plugins: [
            react(),
            tailwindcss(),
            dts({
                include: ["src"],
                outDir: "dist",
                rollupTypes: true,
            }),
        ],
        resolve: {
            alias: { "@": resolve(__dirname, "src") },
        },
        build: {
            lib: {
                entry: resolve(__dirname, "src/index.ts"),
                name: "OmniDS",
                formats: ["es", "cjs"],
                fileName: (format) => `omni-ds.${format}.js`,
            },
            rollupOptions: {
                external: ["react", "react-dom", "react/jsx-runtime"],
                output: {
                    globals: {
                        react: "React",
                        "react-dom": "ReactDOM",
                    },
                },
            },
            cssCodeSplit: false,
        },
    };
});
