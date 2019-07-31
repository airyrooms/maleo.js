const env = process.env.NODE_ENV;
const isDevelopment = env === 'development';
const isTest = env === 'test';

export const preset = (context, opts = {}) => {
  const presets = [
    [
      require('@babel/preset-env').default,
      {
        modules: false,
        // cacheDirectory
        ...opts['preset-env'],
      },
    ],
    [
      require('@babel/preset-react'),
      {
        development: isDevelopment || isTest,
        ...opts['preset-react'],
      },
    ],
  ];

  const plugins = [
    [
      require('@babel/plugin-proposal-decorators'),
      opts['proposal-decorators'] || {
        legacy: true,
      },
    ],
    [
      require('@babel/plugin-proposal-class-properties'),
      opts['class-properties'] || {
        loose: true,
      },
    ],
    require('@babel/plugin-proposal-object-rest-spread'),
    require('@babel/plugin-syntax-dynamic-import'),
    require('react-loadable/babel'),
    require('./plugins/react-loadable-plugin'),
    // for development
    [
      require('@babel/plugin-transform-runtime'),
      {
        regenerator: true,
        helpers: false,
        corejs: 2,
        useESModules: false,
      },
    ],
    // for production
    !isDevelopment && require('babel-plugin-transform-react-remove-prop-types'),
    // require('@babel/runtime'),
  ].filter(Boolean);

  return {
    presets,
    plugins,
  };
};
