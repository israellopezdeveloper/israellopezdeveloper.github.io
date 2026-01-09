import prettier from 'eslint-config-prettier';
import { fileURLToPath } from 'node:url';
import { includeIgnoreFile } from '@eslint/compat';
import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import ts from 'typescript-eslint';
import svelteConfig from './svelte.config.js';

const gitignorePath = fileURLToPath(new URL('./.gitignore', import.meta.url));

export default defineConfig(
  // Respeta .gitignore
  includeIgnoreFile(gitignorePath),

  // -----------------------------
  // 0) Base ignores extra (opcional pero recomendado)
  // -----------------------------
  {
    ignores: ['node_modules/**', '.svelte-kit/**', 'build/**', 'dist/**']
  },

  // -----------------------------
  // 1) BASE JS (sin typed linting)
  //    Esto cubre eslint.config.js y cualquier .js
  // -----------------------------
  js.configs.recommended,

  // globals compartidos
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node }
    },

    rules: {
      // Tus reglas "globales" que NO dependen de type info
      'no-console': ['error', { allow: ['warn', 'error'] }],

      'max-len': [
        'error',
        {
          code: 80,
          ignoreComments: false,
          ignoreTrailingComments: true,
          ignoreUrls: true,
          ignoreStrings: false,
          ignoreTemplateLiterals: false,
          ignoreRegExpLiterals: true,
          tabWidth: 2
        }
      ]
    }
  },

  // -----------------------------
  // 2) TYPESCRIPT (typed linting SOLO para TS)
  // -----------------------------
  {
    files: ['**/*.ts', '**/*.tsx'],
    ...ts.configs.strictTypeChecked[0], // base config (languageOptions/plugins)
    languageOptions: {
      ...ts.configs.strictTypeChecked[0].languageOptions,
      globals: { ...globals.browser, ...globals.node },
      parserOptions: {
        // 🔴 clave: type info solo aquí
        project: ['./tsconfig.eslint.json'],
        tsconfigRootDir: import.meta.dirname
      }
    },
    rules: {
      // Merge de strict + stylistic typed
      ...ts.configs.strictTypeChecked.reduce(
        (acc, cfg) => ({ ...acc, ...(cfg.rules ?? {}) }),
        {}
      ),
      ...ts.configs.stylisticTypeChecked.reduce(
        (acc, cfg) => ({ ...acc, ...(cfg.rules ?? {}) }),
        {}
      ),

      // tu set
      'no-undef': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        { allowExpressions: true }
      ]
    }
  },

  // -----------------------------
  // 3) SVELTE
  // -----------------------------
  ...svelte.configs.recommended,

  // Svelte parser config + type-aware para .svelte
  {
    files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
    plugins: {
      '@typescript-eslint': ts.plugin
    },
    languageOptions: {
      parserOptions: {
        projectService: true,
        extraFileExtensions: ['.svelte'],
        parser: ts.parser,
        svelteConfig
      }
    },
    rules: {
      'no-undef': 'off',
      'svelte/no-navigation-without-resolve': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_'
        }
      ]
    }
  },

  // -----------------------------
  // 4) PRETTIER (siempre al final)
  // -----------------------------
  prettier,
  ...svelte.configs.prettier
);
