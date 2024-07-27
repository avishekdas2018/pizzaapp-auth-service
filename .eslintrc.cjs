module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended-type-checked",
    "prettier",
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  parserOptions: {
    project: true,
    tsconfigRootDir: __dirname,
  },
  root: true,

  rules: {
    "no-console": "error",
    "no-unused-vars": "off",
    "no-empty": "off",
    "ban-ts-comment": "off",
    "prefer-const": "off",
    "no-undef": "off",
    "no-unused-expressions": "off",
    "no-unsafe-call": "off",
    "no-unsafe-member-access": "off",
    "@typescript-eslint/no-unsafe-member-access": "off",
    "@typescript-eslint/no-unsafe-call": "off",
    "@typescript-eslint/no-unsafe-assignment": "off",
    "@typescript-eslint/no-undef": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "@typescript-eslint/ban-ts-comment": "off",
  },
};
