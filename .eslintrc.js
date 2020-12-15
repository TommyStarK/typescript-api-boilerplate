module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
  },
  extends: [
    'airbnb-typescript/base',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12,
    project: ['./tsconfig.eslint.json', './tsconfig.json'],
    tsconfigRootDir: __dirname,
    warnOnUnsupportedTypeScriptVersion: false,
    EXPERIMENTAL_useSourceOfProjectReferenceRedirect: true,
  },
  plugins: [
    '@typescript-eslint',
  ],
  settings: {
    'import/extensions': ['.js', '.jsx', '.ts', '.tsx'],
  },
  rules: {
    'import/no-extraneous-dependencies': 'off',
    '@typescript-eslint/no-empty-function': ['error', { allow: ['constructors'] }],
    '@typescript-eslint/no-useless-constructor': 'off',
    'import/prefer-default-export': 'off',
    'import/extensions': ['error', 'ignorePackages', {
      js: 'never', jsx: 'never', ts: 'never', tsx: 'never',
    }],
    '@typescript-eslint/no-unused-vars': ['error', { vars: 'all', args: 'none', ignoreRestSiblings: false }],
    'no-underscore-dangle': ['error', { allow: ['_id', '_replaceOrCreate'] }],
    'max-classes-per-file': 'off',
    'no-param-reassign': 'off',
    'import/no-unresolved': 'off',
    'import/export': 'off',
    'class-methods-use-this': 'off',
    'max-len': ['error', 120, 4, {
      ignoreComments: true,
      ignoreUrls: true,
      ignorePattern: '^\\s*var\\s.+=\\s*(require\\s*\\()|(/)',
    }],
  },
};
