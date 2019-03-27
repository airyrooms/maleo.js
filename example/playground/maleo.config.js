const tsPlugin = require('@airy/maleo-typescript-plugin');
const cssPlugin = require('@airy/maleo-css-plugin');

module.exports = tsPlugin(
  cssPlugin({
    cssPluginOptions: {
      enableISL: true
    },
    customWrap: './custom-wrap.tsx'
  }),
);
