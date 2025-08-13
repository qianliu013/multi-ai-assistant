import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default tseslint.config(
  {
    // 全局忽略配置
    ignores: [
      'dist/**',
      'node_modules/**',
      '*.cjs',
      '*.mjs',
      'public/**',
      'coverage/**',
      '.rsbuild/**',
      'rsbuild.config.ts', // 临时忽略构建配置
    ],
  },
  {
    // 基础JS配置
    files: ['**/*.js', '**/*.mjs'],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        browser: true,
        es2022: true,
        webextensions: true,
        chrome: 'readonly',
      },
    },
    rules: {
      // 现代化JS规则
      'prefer-const': 'error',
      'no-var': 'error',
      'object-shorthand': 'error',
      'prefer-template': 'error',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': 'warn',
      'no-debugger': 'warn',
    },
  },
  {
    // TypeScript配置
    files: ['**/*.ts', '**/*.tsx'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        browser: true,
        es2022: true,
        webextensions: true,
        chrome: 'readonly',
      },
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      // 继承基础规则
      'prefer-const': 'error',
      'no-var': 'error',
      'object-shorthand': 'error',
      'prefer-template': 'error',
      'no-console': 'warn',
      'no-debugger': 'warn',

      // TypeScript特定规则
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/prefer-nullish-coalescing': 'warn',
      '@typescript-eslint/prefer-optional-chain': 'warn',
      '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',
      '@typescript-eslint/no-misused-promises': 'warn',
      
      // 样式规则
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' }
      ],
      '@typescript-eslint/no-import-type-side-effects': 'error',

      // React Hooks规则
      ...reactHooks.configs.recommended.rules,
      
      // React Refresh规则
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],

      // 禁用重复的基础规则
      'no-unused-vars': 'off',
      'no-undef': 'off', // TypeScript已处理
    },
  },
  {
    // React组件文件特殊规则
    files: ['src/popup/**/*.tsx', 'src/popup/**/*.ts'],
    rules: {
      // Popup组件允许使用console用于调试
      'no-console': 'off',
    },
  },
  {
    // Chrome扩展后台脚本
    files: ['src/background/**/*.ts'],
    languageOptions: {
      globals: {
        chrome: 'readonly',
        browser: true,
      },
    },
    rules: {
      // 后台脚本允许使用console
      'no-console': 'off',
    },
  },
  {
    // Content脚本
    files: ['src/content/**/*.ts'],
    languageOptions: {
      globals: {
        chrome: 'readonly',
        window: 'readonly',
        document: 'readonly',
      },
    },
    rules: {
      // Content脚本允许console（调试需要）
      'no-console': 'off',
      // 浮动Promise警告而不是错误（扩展环境常见）
      '@typescript-eslint/no-floating-promises': 'warn',
    },
  },
  {
    // 配置文件
    files: ['*.config.{js,ts}', '**/*.config.{js,ts}'],
    rules: {
      // 配置文件允许使用require和导入类型
      '@typescript-eslint/no-var-requires': 'off',
      'no-console': 'off',
    },
  }
);