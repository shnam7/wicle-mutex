import { type FlatXoConfig } from 'xo'

const xoConfig: FlatXoConfig = [
    { semicolon: false },
    {
        prettier: 'compat',
        space: 4,
        semicolon: false,
        rules: {
            camelcase: 0,
            strictCamelCase: 0,
            '@typescript-eslint/naming-convention': 0,
            'capitalized-comments': 0,
            'unicorn/prevent-abbreviations': 0,
            'function-paren-newline': 0,
            'implicit-arrow-linebreak': 0,
            '@typescript-eslint/no-empty-function': 0,
            '@typescript-eslint/no-unsafe-call': 0,
            'arrow-body-style': ['error', 'as-needed'],
        },
    },
    // add a separete config that is applied after prettier, so that we can override prettier rules
    {
        files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
        rules: {
            curly: 'off',
            '@stylistic/no-mixed-operators': 'off',
            'jsdoc/require-asterisk-prefix': ['error', 'always'],
            'jsdoc/check-tag-names': ['error', { definedTags: ['note'] }],
        },
    },
]

export default xoConfig
