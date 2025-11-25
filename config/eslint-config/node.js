import js from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier'
import tseslint from 'typescript-eslint'
import globals from 'globals'
import { config as baseConfig } from './base.js'

/**
 * A shared ESLint configuration for Node projects.
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const config = [
  ...baseConfig,
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      parserOptions: { ecmaVersion: 'latest' },
      globals: {
        ...globals.node,
      },
    },
  },
]
