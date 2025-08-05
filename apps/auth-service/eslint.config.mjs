// @ts-check
import eslint from '@eslint/js';
import eslintPluginStandard from 'eslint-config-standard';

export default {
  ignores: ['eslint.config.mjs'],
  ...eslint.configs.recommended,
  extends: [
    'eslint:recommended',
    'standard'
  ],
  languageOptions: {
    sourceType: 'module',
    parserOptions: {
      ecmaVersion: 2021
    }
  },
  rules: {
    // Add any custom rules here if needed
  }
};