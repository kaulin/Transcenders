import tseslint from "typescript-eslint";
import globals from "globals";
import { defineConfig } from "eslint/config";
import prettier from 'eslint-plugin-prettier';


export default defineConfig([
  {
    files: ['**/*.ts', '**/*.tsx'],

    plugins: {
      '@typescript-eslint': tseslint.plugin,
      prettier,
    },

    languageOptions: {
      parser: tseslint.parser,
      parserOptions: { sourceType: 'module' },
      globals: globals.node,
    },
    rules: {
      ...tseslint.configs.recommended.rules,

      'prettier/prettier': 'warn',
    },
  },
]);
