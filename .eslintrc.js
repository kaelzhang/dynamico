module.exports = {
  extends: require.resolve('eslint-config-ostai'),
  rules: {
    'no-case-declarations': 'off'
  },
  env: {
    mocha: true
  }
}
