import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import prettier from "eslint-plugin-prettier";
import react from "eslint-plugin-react";
import eslintPluginReactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

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
    },
    plugins: { prettier, "react-refresh": reactRefresh },
    files: ["**/*.ts", "**/*.tsx"],
  },
  {
    files: ["**/*.{js,jsx,mjs,cjs,ts,tsx}"],
    plugins: {
      react,
      "react-hooks": eslintPluginReactHooks,
    },
    rules: {
      ...eslintPluginReactHooks.configs.recommended.rules,
      ...react.configs.recommended.rules,
      "react/react-in-jsx-scope": 0,
      "react/no-unescaped-entities": 0,
      "react/prop-types": 0,
      "react/display-name": 0,
    },
  },
  { ignores: ["**/*.js"], ...eslintPluginPrettierRecommended },
);
