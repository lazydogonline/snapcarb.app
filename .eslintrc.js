// SnapCarb ESLint Configuration
// Simple configuration that works with current dependencies

module.exports = {
  root: true,
  env: {
    node: true,
    es6: true,
    jest: true,
  },
  extends: [
    'eslint:recommended',
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  rules: {
    // Security rules
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    'no-script-url': 'error',
    
    // Code quality rules
    'no-unused-vars': 'warn',
    'no-console': 'warn',
    'no-debugger': 'error',
    'no-alert': 'warn',
    'prefer-const': 'error',
    'no-var': 'error',
    
    // Best practices
    'eqeqeq': 'error',
    'no-duplicate-imports': 'error',
    'no-unreachable': 'error',
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    '.expo/',
    'coverage/',
    '__tests__/',
  ],
};