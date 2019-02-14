const path = require('path');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const TsConfigPathPlugin = require('tsconfig-paths-webpack-plugin');

const whitelistEntries = /(webpack-hot-middleware|react-hot-loader|_server|_client)/;

const replaceJStoTS = (entries = {}) =>
  Object.keys(entries).reduce((p, c) => {
    let entry = entries[c];

    if (typeof entry === 'string') {
      if (whitelistEntries.test(entry)) {
        return {
          ...p,
          [c]: entry,
        };
      }

      return {
        ...p,
        [c]: entry.replace(/\.js/, '.ts') && entry.replace(/\.jsx/, '.tsx'),
      };
    }

    return {
      ...p,
      [c]: Object.values(replaceJStoTS(entry)),
    };
  }, {});

module.exports = (customConfig = {}) => {
  return Object.assign({}, customConfig, {
    webpack(config, context, next) {
      const { projectDir, isDev, isServer } = context;
      config.resolve.extensions.push('.ts', '.tsx');

      config.resolve.plugins = [
        ...(config.resolve.plugins || []),
        new TsConfigPathPlugin({
          configFile: path.resolve(projectDir),
        }),
      ];

      config.module.rules.push({
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          require.resolve('@airy/maleo/lib/build/loaders/maleo-babel-loader'),
          {
            loader: require.resolve('ts-loader'),
            options: {
              transpileOnly: true,
            },
          },
        ].filter(Boolean),
      });

      config.entry = replaceJStoTS(config.entry);

      if (isDev) config.plugins.push(new ForkTsCheckerWebpackPlugin());

      next(customConfig);
    },
  });
};
