const env = process.env.NODE_ENV;
const isDevelopment = env === 'development';
const isTest = env === 'test';

interface Opts {
  isServer?: boolean | undefined;
  esModules?: boolean;
  server?: { [key: string]: any };
  client?: { [key: string]: any };
}

export const preset = (context, opts: Opts = {}) => {
  const { isServer, server = {}, client = {}, esModules } = opts;

  const presets = [
    // client configuration with or without esm
    isServer === false &&
      !esModules && [
        require('@babel/preset-env').default,
        {
          modules: false,
          ...opts['preset-env'],
          ...client['preset-env'],
        },
      ],

    isServer === false &&
      !!esModules && [
        require('@babel/preset-env').default,
        {
          targets: {
            esmodules: true,
          },
        },
      ],

    isServer === true && [
      require('@babel/preset-env').default,
      {
        modules: false, // cacheDirectory
        targets: { node: 'current' },
        ...opts['preset-env'],
        ...server['preset-env'],
      },
    ],

    isServer === undefined && [
      require('@babel/preset-env').default,
      {
        modules: false, // cacheDirectory
        ...opts['preset-env'],
      },
    ],
    [
      require('@babel/preset-react'),
      { development: isDevelopment || isTest, ...opts['preset-react'] },
    ],
  ].filter(Boolean);

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
    [
      require('@babel/plugin-transform-runtime'),
      {
        regenerator: true,
        helpers: false,
        corejs: 2,
        useESModules: isServer === false && !!esModules,
      },
    ],
    // for production
    !isDevelopment && require('babel-plugin-transform-react-remove-prop-types'),
  ].filter(Boolean);

  return {
    presets,
    plugins,
  };
};
