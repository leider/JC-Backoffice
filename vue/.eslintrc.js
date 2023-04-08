module.exports = {
  root: true,
  env: {
    es2021: true,
    node: true,
  },
  extends: [
    "plugin:vue/essential",
    "eslint:recommended",
    "@vue/prettier",
    "plugin:@typescript-eslint/recommended",
    "@vue/eslint-config-typescript/recommended",
    "plugin:react/recommended",
  ],
  parserOptions: {
    ecmaVersion: 2020,
  },
  plugins: ["react"],
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
    "vue/multi-word-component-names": "off",
  },
  overrides: [
    {
      files: ["**/__tests__/*.{j,t}s?(x)", "**/tests/unit/**/*.spec.{j,t}s?(x)"],
      env: {
        jest: true,
      },
    },
  ],
};
