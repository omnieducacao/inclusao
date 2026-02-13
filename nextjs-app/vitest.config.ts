import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "."),
    },
  },
  test: {
    globals: true,
    environment: "node",
    include: [
      "__tests__/unit/**/*.test.ts",
      "__tests__/integration/**/*.test.ts",
    ],
    coverage: {
      provider: "v8",
      include: ["lib/**/*.ts"],
    },
  },
});
