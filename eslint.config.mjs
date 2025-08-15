// eslint.config.mjs
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';
import unusedImports from 'eslint-plugin-unused-imports';
import prettier from 'eslint-config-prettier';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default [
  // Ignorados: sustituyen a .eslintignore
  {
    ignores: [
      '.next/**',
      'out/**',
      'node_modules/**',
      'dist/**',
      'coverage/**',
      // evita que ESLint lintée sus propios archivos de config
      'eslint.config.*',
      '.eslintrc.*',
      'next.config.*',
      'postcss.config.*',
      'tailwind.config.*',
      'vite.config.*',
      'webpack.*',
      // scripts u otras toolings si quieres
      'scripts/**',
    ],
  },

  // ---------- TypeScript (con type-check) ----------
  ...tseslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: __dirname,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      import: importPlugin,
      'unused-imports': unusedImports,
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports' },
      ],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: { attributes: false } },
      ],
      '@typescript-eslint/explicit-function-return-type': [
        'warn',
        { allowExpressions: true },
      ],

      'unused-imports/no-unused-imports': 'error',
      'no-duplicate-imports': 'error',
      'import/newline-after-import': ['error', { count: 1 }],
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            ['parent', 'sibling', 'index'],
            'object',
            'type',
          ],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],

      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
    },
  },

  // ---------- JavaScript (sin type-check) ----------
  {
    files: ['**/*.js', '**/*.cjs', '**/*.mjs'],
    // usa parser por defecto (Espree) o, si prefieres @typescript-eslint/parser, pon project: null
    // languageOptions: { parser: tseslint.parser, parserOptions: { project: null } },
    plugins: {
      import: importPlugin,
      'unused-imports': unusedImports,
    },
    rules: {
      'unused-imports/no-unused-imports': 'error',
      'no-duplicate-imports': 'error',
      'import/newline-after-import': ['error', { count: 1 }],
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            ['parent', 'sibling', 'index'],
            'object',
            'type',
          ],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
    },
  },

  // Desactiva conflictos con Prettier
  prettier,
];
