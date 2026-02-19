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
    exclude: [
      "node_modules",
      ".next",
      "**/*.config.*",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "text-summary", "html", "json"],
      include: [
        "lib/**/*.ts",
        "app/api/**/*.ts",
      ],
      exclude: [
        "**/*.d.ts",
        "**/*.config.*",
        "**/node_modules/**",
        "**/__tests__/**",
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 60,
        statements: 70,
      },
    },
    reporters: ["verbose"],
    outputFile: {
      junit: "./__tests__/reports/junit.xml",
    },
    testTimeout: 10000,
    hookTimeout: 10000,
    teardownTimeout: 5000,
    pool: "forks",
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    isolation: true,
    fileParallelism: false,
    maxConcurrency: 1,
  },
});
