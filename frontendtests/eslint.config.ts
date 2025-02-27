import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import prettier from "eslint-plugin-prettier";
import lodash from "eslint-plugin-lodash";
import sonarjs from "eslint-plugin-sonarjs";
import codeceptjs from "eslint-plugin-codeceptjs";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    settings: {
      react: { version: "detect" },
    },
  },
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-expressions": "off",
      "no-console": "error",
      "no-sync": "off",
      "no-process-exit": "error",
      eqeqeq: "error",
      ...codeceptjs.configs.recommended.rules,
    },
    plugins: { prettier, codeceptjs },
    files: ["**/*.ts"],
  },
  {
    files: ["**/*.{ts}"],
    plugins: {
      lodash,
      sonarjs,
    },
    rules: {
      ...lodash.configs.recommended.rules,
      ...sonarjs.configs.recommended.rules,
      "no-sync": "off",
      "lodash/prefer-lodash-method": [
        "error",
        {
          ignoreMethods: [
            "assign",
            "endsWith",
            "includes",
            "isArray",
            "reduce",
            "repeat",
            "replace",
            "split",
            "startsWith",
            "toLower",
            "trim",
          ],
        },
      ],
      "sonarjs/x-powered-by": "off",
      "sonarjs/no-clear-text-protocols": "off",
      "sonarjs/assertions-in-tests": "off",
      "sonarjs/slow-regex": "off",
      "sonarjs/no-invariant-returns": "off",
      "sonarjs/no-nested-conditional": "off",
      "sonarjs/no-nested-functions": "off",
    },
  },
  { ignores: ["steps.d.ts"] },
  { ignores: ["**/*.js"], ...eslintPluginPrettierRecommended },
);
