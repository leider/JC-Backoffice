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
      "react-perf/jsx-no-new-function-as-prop": "off", // remove same as "react/jsx-no-bind": "off",
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
      ...react.configs.all.rules,
      ...lodash.configs.recommended.rules,
      ...sonarjs.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/no-unescaped-entities": "off",
      "react/prop-types": "off",
      "react/jsx-max-depth": "off",
      "react/forbid-component-props": "off",
      "react/no-danger": "off",
      "no-sync": "off",
      "react/jsx-no-bind": "off",
      "react/jsx-filename-extension": ["error", { extensions: [".tsx"] }],
      "react/jsx-no-literals": "off",
      "react/require-default-props": "off",
      "react/no-multi-comp": "off",
      //"react/jsx-sort-props": "off",
      "react/function-component-definition": "off",
      "react/prefer-read-only-props": "off",
      "react/jsx-no-leaked-render": "off",
      "react/jsx-no-constructed-context-values": "off",
      "react/no-unused-prop-types": "off",
      "react/jsx-props-no-spreading": "off",
      "react/destructuring-assignment": "off",
      "react/jsx-handler-names": "off",
      "react/no-unstable-nested-components": "off",
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
