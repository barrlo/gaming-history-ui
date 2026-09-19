import javascript from '@eslint/js';
import tseslint from 'typescript-eslint';
import hooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import vitest from '@vitest/eslint-plugin';
import playwright from 'eslint-plugin-playwright';

export default tseslint.config(
  {
    ignores: [
      'dist/**',
      'coverage/**',
      'src/api/generated/**',
      'public/mockServiceWorker.js',
      'playwright-report/**',
      'test-results/**',
    ],
  },
  javascript.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'JSXText[value=/\\S/]',
          message: "Wrap JSX text in a quoted string expression, for example {'Text'}.",
        },
      ],
      'id-length': ['error', { min: 3, properties: 'never', exceptions: ['_'] }],
      'no-unused-vars': ['error', { args: 'all', argsIgnorePattern: '^_$', reportUsedIgnorePattern: true }],
      '@typescript-eslint/naming-convention': [
        'error',
        { selector: 'variable', format: null, custom: { regex: '^.{3,}$', match: true } },
        { selector: 'parameter', format: null, custom: { regex: '^(?:_|.{3,})$', match: true } },
      ],
      curly: ['error', 'all'],
      'prefer-arrow-callback': 'error',
      'func-style': ['error', 'expression'],
      'padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: 'import', next: '*' },
        { blankLine: 'always', prev: 'block-like', next: '*' },
        { blankLine: 'always', prev: '*', next: 'return' },
        { blankLine: 'never', prev: 'import', next: 'import' },
      ],
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    plugins: { 'react-hooks': hooks },
    rules: {
      ...hooks.configs.recommended.rules,
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { args: 'all', argsIgnorePattern: '^_$', reportUsedIgnorePattern: true },
      ],
    },
  },
  {
    files: ['**/*.{test,spec}.{ts,tsx,js,jsx}'],
    ignores: ['e2e/**'],
    plugins: { vitest },
    languageOptions: { globals: vitest.environments.env.globals },
    rules: {
      ...vitest.configs.recommended.rules,
      'vitest/require-top-level-describe': 'error',
      'vitest/consistent-test-it': ['error', { fn: 'it', withinDescribe: 'it' }],
      'vitest/valid-title': ['error', { mustMatch: { it: '^should \\S', test: '^should \\S' } }],
      'vitest/padding-around-before-each-blocks': 'error',
      'vitest/padding-around-before-all-blocks': 'error',
      'vitest/padding-around-after-each-blocks': 'error',
      'vitest/padding-around-after-all-blocks': 'error',
      'vitest/padding-around-describe-blocks': 'error',
      'vitest/padding-around-test-blocks': 'error',
      'vitest/padding-around-expect-groups': 'error',
    },
  },
  {
    ...playwright.configs['flat/recommended'],
    files: ['e2e/**/*.{ts,tsx,js,jsx}'],
    plugins: { ...playwright.configs['flat/recommended'].plugins, vitest },
    rules: {
      ...playwright.configs['flat/recommended'].rules,
      // This whitespace-only rule also handles Playwright's awaited assertions.
      'vitest/padding-around-expect-groups': 'error',
    },
  },
  { files: ['**/*.{js,mjs}'], languageOptions: { globals: globals.node } },
);
