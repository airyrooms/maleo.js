const tsPlugin = require('@airy//typescript-plugin');
const cssPlugin = require('@airy//css-plugin');

module.exports = tsPlugin(
  cssPlugin({
    env: 'production',
  }),
);
