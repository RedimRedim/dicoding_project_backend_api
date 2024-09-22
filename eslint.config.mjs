export default {
  languageOptions: {
    globals: {
      require: true,
      module: true,
    },
  },

  extends: ["eslint:recommended"],
  rules: {
    "no-unused-vars": "warn",
    quotes: ["error", "double"],
  },
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: "module",
  },
};
