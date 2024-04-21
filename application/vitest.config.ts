// vitest.config.ts
import { mergeConfig } from "vite";
import { defineConfig } from "vitest/config";

export default mergeConfig(
  {},
  defineConfig({
    test: {
      globals: true,
      globalSetup: "./test-globals.ts",
      include: ["**/*.test.ts"],
    },
  }),
);
