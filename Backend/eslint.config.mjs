import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import typescriptEslintEslintPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import betterMaxParams from 'eslint-plugin-better-max-params';
import importPlugin from 'eslint-plugin-import';
import prettierPlugin from 'eslint-plugin-prettier';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

const maxClassesPerFile = 1;
const maxDepth = 4;
const complexityError = 10;

export default [
  {
    ignores: [
      '.eslintrc.nest.js',
      'eslint.config.mjs',
      'main.ts',
      'app.module.ts',
    ],
  },
  ...compat.extends(
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    //Extends two more configuration from 'import; plugin
    'plugin:import/recommended',
    'plugin:import/typescript',
  ),
  {
    plugins: {
      '@typescript-eslint': typescriptEslintEslintPlugin,
      'unused-imports': unusedImports,
      'better-max-params': betterMaxParams,
      import: importPlugin,
      prettier: prettierPlugin,
    },

    settings: {
      'import/parsers': {
        '@typescript-eslint/parser': ['.ts'],
      },
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
      },
    },

    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },

      parser: tsParser,
      ecmaVersion: 5,
      sourceType: 'module',

      parserOptions: {
        project: 'tsconfig.json',
        tsconfigRootDir: __dirname,
      },
    },

    rules: {
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-unused-vars': ['warn'],
      // Note: you must disable the base rule as it can report incorrect errors
      'require-await': 'warn',
      '@typescript-eslint/await-thenable': 'warn',
      '@typescript-eslint/require-await': 'warn',
      '@typescript-eslint/no-floating-promises': 'warn',
      // Sort imports
      'sort-imports': [
        'warn',
        {
          ignoreCase: true,
          ignoreDeclarationSort: true,
          ignoreMemberSort: false,
          memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
          allowSeparatedGroups: false,
        },
      ],
      // turn on errors for missing imports
      'import/no-unresolved': 'warn',
      'import/order': [
        'warn',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'unknown',
          ],
          pathGroups: [
            {
              pattern: '@nestjs/**',
              group: 'external',
              position: 'before',
            },
          ],
          distinctGroup: true,
          'newlines-between': 'always-and-inside-groups',
          // 'newlines-between': '',
          pathGroupsExcludedImportTypes: ['internal'],
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
      // End sort imports

      'prettier/prettier': [
        'warn',
        {
          endOfLine: 'auto',
        },
      ],

      'unused-imports/no-unused-imports': 'warn',

      // No Any
      '@typescript-eslint/no-explicit-any': ['warn'],
      // SOLID principles
      'max-classes-per-file': ['warn', maxClassesPerFile], // Single Responsibility Principle (SRP)
      'no-empty-function': ['warn', { allow: ['constructors'] }], // Open/Closed Principle (OCP)
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ], // Interface Segregation Principle (ISP)
      'no-param-reassign': 'warn', // Dependency Inversion Principle (DIP)
      'no-mixed-spaces-and-tabs': 'warn', // Liskov Substitution Principle (LSP)
      // Clean Code
      'max-depth': ['warn', maxDepth], // Limits nesting depth
      'better-max-params/better-max-params': [
        'warn',
        {
          func: 3,
          constructor: 10,
        },
      ],
      complexity: ['warn', complexityError],
      'prefer-const': 'warn', // Promotes the use of const over let
      'no-duplicate-imports': 'warn', // Avoids duplicate imports
      'no-magic-numbers': ['warn', { ignoreArrayIndexes: true }], // Avoids magic numbers
      'no-nested-ternary': 'warn', // Avoids the use of nested ternary operators
      'no-unneeded-ternary': 'warn', // Avoids the unnecessary use of ternary operators
      'object-shorthand': 'warn', // Promotes the use of object shorthand syntax
      'prefer-template': 'warn', // Promotes the use of template strings
      'no-else-return': 'warn', // Avoids the use of else after a return
      'no-useless-return': 'warn', // Avoids unnecessary returns
      'no-useless-concat': 'warn', // Avoids unnecessary concatenation
      'prefer-destructuring': 'warn', // Promotes the use of destructuring
      'no-duplicate-case': 'warn', // Avoids duplicate cases in switch statements
      'no-empty': 'warn', // Avoids empty blocks
      'no-multi-spaces': 'warn', // Avoids multiple consecutive spaces
      'no-trailing-spaces': 'warn', // Avoids trailing whitespace at the end of lines
      // No Global Values
      'no-global-assign': 'warn',
      'no-implicit-globals': 'warn',
    },
  },
];
