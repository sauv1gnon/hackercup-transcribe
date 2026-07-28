import eslint from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const backendFiles = [
  'apps/api/**/*.{ts,tsx}',
  'packages/**/*.{ts,tsx}',
  'scripts/**/*.{js,mjs,ts}',
  'tests/**/*.{ts,tsx}',
  '*.{js,mjs,ts}',
];

export default tseslint.config(
  {
    ignores: ['.git/**', 'coverage/**', 'dist/**', 'node_modules/**', 'supported_endpoint.log'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,
  {
    files: ['**/*.{js,mjs,ts,tsx}'],
    rules: {
      curly: ['error', 'all'],
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'no-console': 'error',
      'no-restricted-syntax': [
        'error',
        {
          selector: 'TSEnumDeclaration',
          message: 'Prefer a const object and derived union type over a TypeScript enum.',
        },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          fixStyle: 'inline-type-imports',
          prefer: 'type-imports',
        },
      ],
    },
  },
  {
    files: backendFiles,
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      'no-console': 'off',
    },
  },
  {
    files: ['apps/web/**/*.{ts,tsx}'],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    files: ['packages/domain/src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@salinaral/*'],
              message: 'The domain module cannot depend on another SalinAral module.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['packages/application/src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '@salinaral/api',
                '@salinaral/contracts',
                '@salinaral/infrastructure',
                '@salinaral/web',
              ],
              message: 'Application code may depend only on the domain module.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['packages/contracts/src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@salinaral/*'],
              message: 'Transport contracts must remain independent of other SalinAral modules.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['apps/web/src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '@salinaral/api',
                '@salinaral/application',
                '@salinaral/domain',
                '@salinaral/infrastructure',
              ],
              message: 'The browser may consume transport contracts, never backend internals.',
            },
          ],
        },
      ],
    },
  },
);
