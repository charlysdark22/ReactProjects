module.exports = {
  extends: [
    'react-app',
    'react-app/jest'
  ],
  rules: {
    // Deshabilitar reglas que no son críticas para el desarrollo
    'no-unused-vars': 'warn',
    'react-hooks/exhaustive-deps': 'warn',
    'no-use-before-define': 'warn',
    
    // Reglas específicas para mejorar la calidad del código
    'prefer-const': 'error',
    'no-var': 'error',
    'no-console': 'warn',
    
    // Reglas de React
    'react/jsx-uses-react': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    
    // Reglas de importación
    'import/order': [
      'error',
      {
        'groups': [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index'
        ],
        'newlines-between': 'always',
        'alphabetize': {
          'order': 'asc',
          'caseInsensitive': true
        }
      }
    ]
  },
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  }
};