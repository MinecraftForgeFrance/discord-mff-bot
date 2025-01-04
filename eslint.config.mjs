import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    eslint.configs.recommended,
    tseslint.configs.recommended,
    {
        files: [
            'src/**/*.ts',
        ],
        rules: {
            'quotes': ['error', 'single', { avoidEscape: true }],
            'curly': 'error',
            'brace-style': ['error', 'stroustrup', { 'allowSingleLine': true }],
            'template-curly-spacing': 'error',
            'array-bracket-spacing': ['error', 'never'],
            'object-curly-spacing': ['error', 'always'],
        },
    },
);
