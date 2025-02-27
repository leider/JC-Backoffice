import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import prettier from "eslint-plugin-prettier";
import react from "eslint-plugin-react";
import eslintPluginReactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import lodash from "eslint-plugin-lodash";
import perf from "eslint-plugin-react-perf";
import sonarjs from "eslint-plugin-sonarjs";

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
      "no-sync": "error",
      "no-process-exit": "error",
      eqeqeq: "error",
      "react-refresh/only-export-components": "error",
      "react-perf/jsx-no-new-object-as-prop": "off",
      "react-perf/jsx-no-new-array-as-prop": "off",
      "react-perf/jsx-no-new-function-as-prop": "off",
    },
    plugins: {
      prettier,
      "react-refresh": reactRefresh,
      "react-perf": perf,
    },
    files: ["**/*.ts", "**/*.tsx"],
  },
  {
    files: ["**/*.{js,jsx,mjs,cjs,ts,tsx}"],
    plugins: {
      react,
      "react-hooks": eslintPluginReactHooks,
      lodash,
      sonarjs,
    },
    rules: {
      ...eslintPluginReactHooks.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...lodash.configs.recommended.rules,
      ...sonarjs.configs.recommended.rules,
      "react/react-in-jsx-scope": 0,
      "react/no-unescaped-entities": 0,
      "react/prop-types": 0,
      "react/display-name": 0,
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
  { ignores: ["**/*.js"], ...eslintPluginPrettierRecommended },
);
