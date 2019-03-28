const cssPlugin = require('@airy/maleo-css-plugin');

module.exports = cssPlugin({
  enableISL: true,
  cssLoader: {
    modules: true,
    camelCase: true,
  },
});
