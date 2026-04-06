import jsdoc from "eslint-plugin-jsdoc";
import tseslint from "typescript-eslint";

export default tseslint.config({
  files: ["**/*.{ts,tsx}"],
  languageOptions: {
    parser: tseslint.parser,
  },
  plugins: {
    jsdoc,
  },
  rules: {
    "jsdoc/require-jsdoc": [
      "error",
      {
        enableFixer: false,
        publicOnly: true,
        require: {
          ArrowFunctionExpression: true,
          FunctionDeclaration: true,
          MethodDefinition: true,
          ClassDeclaration: true,
        },
        contexts: ["ExportNamedDeclaration > VariableDeclaration"],
      },
    ],
  },
});
