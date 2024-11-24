import exampleConfigs from "../eslint.config.js";

export default [
  ...exampleConfigs,
  {
    rules: {
      "no-unused-vars": "off",
    },
  },
];
