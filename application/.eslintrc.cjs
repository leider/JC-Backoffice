module.exports = {
  env: { es2020: true, node: true, es6: true },
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended", "plugin:react-hooks/recommended", "plugin:prettier/recommended"],
  parser: "@typescript-eslint/parser",
  parserOptions: { ecmaVersion: "latest", sourceType: "module" },
  plugins: ["react-refresh"],
  rules: {
    "react-refresh/only-export-components": "warn",
    "@typescript-eslint/no-explicit-any": "warn",
    "no-console": "error",
    "no-sync": "error",
    eqeqeq: "error",
  },
};
