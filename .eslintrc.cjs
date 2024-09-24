module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  extends: [
    '@adobe/helix',
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  env: {
    browser: true,
    es6: true,
  },
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  rules: {
    // allow reassigning param
    'no-param-reassign': [2, { props: false }],
    'linebreak-style': ['error', 'unix'],
    'import/extensions': ['error', {
      js: 'always',
    }],
    'import/prefer-default-export': 'off',
    '@typescript-eslint/ban-ts-comment': 'warn',
  },
  plugins: [
    '@typescript-eslint',
    'import',
  ],
  settings: {
    'import/resolver': {
      exports: {},
      "typescript": {},
    },
  },
  ignorePatterns: ['xp/'],
};
