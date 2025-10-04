module.exports = {
  root: true,
  env: { 
    browser: true, 
    es2020: true,
    node: true // Add node environment for process global
  },
  globals: {
    process: 'readonly' // Allow process global
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parserOptions: { 
    ecmaVersion: 'latest', 
    sourceType: 'module' 
  },
  settings: { 
    react: { 
      version: '18.2' 
    } 
  },
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    'react/prop-types': 'off', // We're not using prop-types
    'react/no-unescaped-entities': 'off', // Allow unescaped entities
    'no-unused-vars': ['warn', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^(_|React$)' // Allow unused React imports
    }],
  },
}