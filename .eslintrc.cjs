module.exports = {
  env: {
    es6: true,
    node: true,
    mocha: true,
  },
  parser: "@typescript-eslint/parser",
  extends: [
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
  ],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module",
  },
  settings: {
    "html/html-extensions": [".html", ".we"], // consider .html and .we files as HTML
  },
  globals: {
    document: true,
    window: true,
  },
  rules: {
    "no-console": 2,
    '@typescript-eslint/no-non-null-assertion': 0,
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
  plugins: ["promise", "import-order", "jsdoc", "html"],
};
