import { defineConfig } from "eslint/config";
import tseslint from 'typescript-eslint';

export default defineConfig(
    tseslint.configs.recommended,
    {
        files: [
            'src/**/*.ts',
        ],
        rules: {
            'semi': ['error', 'always'],
            'quotes': ['error', 'single', { avoidEscape: true }],
            'curly': 'error',
            'brace-style': ['error', 'stroustrup', { 'allowSingleLine': true }],
            'prefer-const': 'error',
            'template-curly-spacing': 'error',
            'array-bracket-spacing': ['error', 'never'],
            'object-curly-spacing': ['error', 'always'],
        },
    },
);
