 
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['./tsconfig.json'],
    tsconfigRootDir: __dirname,
  },
  plugins: ['@typescript-eslint', 'import', 'unused-imports'],
  extends: [
    'next/core-web-vitals', // Estándar Next.js + Web Vitals
    'plugin:@typescript-eslint/recommended', // Reglas TS base
    'plugin:@typescript-eslint/recommended-requiring-type-checking', // +type-check
    'plugin:import/recommended',
    'plugin:import/typescript',
    'eslint:recommended',
    'prettier', // Desactiva reglas que chocan con Prettier
  ],
  settings: {
    'import/resolver': {
      typescript: { project: './tsconfig.json' },
    },
  },
  rules: {
    // --- Estrictas de TS:
    '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/no-misused-promises': [
      'error',
      { checksVoidReturn: { attributes: false } },
    ],
    '@typescript-eslint/explicit-function-return-type': ['warn', { allowExpressions: true }],
    '@typescript-eslint/no-unnecessary-type-assertion': 'error',
    '@typescript-eslint/no-unsafe-assignment': 'off', // súbela a 'error' si tu código ya está limpio

    // --- Limpieza de imports:
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

    // --- Next/React buenas prácticas:
    'react/jsx-key': 'error',

    // --- Varias:
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-debugger': 'error',
  },
  overrides: [
    // Archivos de configuración, scripts, etc. sin type-check completo:
    {
      files: ['*.config.*', 'next.config.*', 'postcss.config.*', 'tailwind.config.*'],
      parserOptions: { project: null },
    },
  ],
};
