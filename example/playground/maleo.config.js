const tsPlugin = require('@airy/maleo-typescript-plugin');
const cssPlugin = require('@airy/maleo-css-plugin');

const isDev = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'staging';

module.exports = tsPlugin(
  cssPlugin({
    enableISL: true,
    csp: {
      directives: {
        defaultSrc: [`'self'`],
        styleSrc: [`'self'`, `'unsafe-inline'`],
      },
    },
    customWrap: './custom-wrap.tsx',
    isDev,
    staticPages: {
      '/detail': {
        page: './src/Detail/index.tsx',
      },
      '/search': {
        page: './src/Search/index.tsx',
      },
    },
  }),
);
