module.exports = {
  root: true,
  extends: 'airbnb-base',
  plugins: ['import'],
  env: {
    node: true,
    jest: true
  },
  rules: {
    'array-bracket-spacing': [
      'error',
      'always',
      {
        objectsInArrays: false,
        arraysInArrays: false
      }
    ],
    'arrow-parens': ['error', 'always'],
    'comma-dangle': ['error', 'never'],
    'func-names': 'off',
    'operator-linebreak': 'off',
    'implicit-arrow-linebreak': 'off',
    'camelcase': 'off',
    'import/named': 'off',
    semi: ['error', 'never']
  }
}
