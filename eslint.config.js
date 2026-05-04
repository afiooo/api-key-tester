import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  // Ignored paths
  {
    ignores: ['dist', 'node_modules', '.vite', '**/*.tsbuildinfo'],
  },

  // Application source (browser environment)
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      // The two classic React-hook rules — keeps the existing
      // // eslint-disable-next-line react-hooks/exhaustive-deps comments meaningful.
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // Vite HMR friendliness
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],

      // tsc already enforces unused locals/params via tsconfig.app.json — turn off
      // ESLint's duplicate so we don't get two diagnostics for the same problem.
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },

  // Web Workers run in a worker scope, not the window
  {
    files: ['src/workers/**/*.ts'],
    languageOptions: {
      globals: globals.worker,
    },
  },

  // Build / config files run in Node
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['*.config.{js,ts,mjs,cjs}', 'vite.config.ts'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: globals.node,
    },
  },
);
