import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import storybook from 'eslint-plugin-storybook';
import prettierConfig from 'eslint-config-prettier';

const muiBarrelPattern = {
  regex: '^@mui/[^/]+$',
  message:
    "Barrel imports hurt dev startup/rebuild. Use path imports: import Button from '@mui/material/Button'; types live in '@mui/material/styles'.",
};

const deepmergePattern = {
  regex: '^@mui/utils/deepmerge$',
  message:
    'Raw deepmerge replaces styleOverrides/variants instead of composing them. Use mergeThemeOptions (src/design/merge-theme-options.ts).',
};

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettierConfig,
  {
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'no-restricted-imports': ['error', { patterns: [muiBarrelPattern, deepmergePattern] }],
    },
    settings: {
      react: { version: 'detect' },
    },
  },
  {
    // The one legitimate deepmerge call site: mergeThemeOptions itself wraps it.
    files: ['src/design/merge-theme-options.ts'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [muiBarrelPattern] }],
    },
  },
  {
    files: ['**/*.stories.tsx', '**/*.stories.ts'],
    plugins: { storybook },
    rules: {
      ...storybook.configs.recommended.rules,
    },
  },
  {
    ignores: ['dist/', 'storybook-static/', 'node_modules/', 'scripts/'],
  },
);
