module.exports = {
  extends: [
    'eslint:recommended',
    'react-app',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:@next/next/recommended',
    'next/core-web-vitals',
    'plugin:jest/recommended',
    'plugin:testing-library/react',
    'plugin:jsx-a11y/recommended',
    'plugin:tailwindcss/recommended',
    'plugin:storybook/recommended',
    'plugin:import/recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  plugins: [
    'react',
    'react-hooks',
    'jsx-a11y',
    'jest',
    'testing-library',
    'tailwindcss',
    'import',
    '@typescript-eslint',
    'prettier',
  ],
  rules: {
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'error',
    'jsx-a11y/anchor-is-valid': 'off',
    '@typescript-eslint/quotes': [
      'error',
      'single',
      {
        avoidEscape: true,
        allowTemplateLiterals: true,
      },
    ],
    'tailwindcss/no-custom-classname': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    'testing-library/no-node-access': 'off',
    'react/void-dom-elements-no-children': 'error',
    'react/destructuring-assignment': ['error', 'always'],
    'react/button-has-type': [
      'error',
      {
        button: true,
        submit: true,
        reset: false,
      },
    ],
    'react/jsx-no-useless-fragment': 'error',
    'import/order': 'warn',
    'import/no-namespace': 'off',
    'import/no-unresolved': ['off', { commonjs: true }],
    '@typescript-eslint/consistent-type-imports': 'warn',
  },
  settings: {
    'import/resolver': {
      alias: {
        map: [['@app', './src']],
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
      },
    },
  },
};
