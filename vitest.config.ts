import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import path from "path"

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    testTimeout: 15_000,
    environmentOptions: {
      jsdom: {
        runScripts: "dangerously",
      },
    },
    coverage: {
      reporter: ["text", "json", "html", "lcov"],
      exclude: [
        "node_modules/",
        "src/test/",
        "**/*.stories.*",
        "**/*.config.*",
        "src/types/**",
        "src/i18n/messages/**",
        "src/i18n/types.ts",
      ],
      thresholds: {
        branches: 50,
        functions: 50,
        lines: 50,
        statements: 50,
      },
    },
    server: {
      deps: {
        inline: ["next-intl"],
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
