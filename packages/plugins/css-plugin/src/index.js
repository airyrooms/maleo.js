const chalk = require('chalk');

// Default options for CSS Loader
// https://github.com/webpack-contrib/css-loader#options
const defaultOptions = {
  enableISL: false,
  extractCss: false,
  cssLoader: {
    url: true,
    import: true,
    modules: false,
    localIdentName: '[hash:base64]',
    context: undefined,
    hashPrefix: undefined,
    getLocalIdent: undefined,
    sourceMap: false,
    camelCase: false,
    importLoaders: 0,
    exportOnlyLocals: false,
  },
};

const defaultExtractCssOptions = {
  filename: '[name].css',
  chunkFilename: 'style-chunk-[name].css',
  singleCssFile: false,
  publicPath: undefined,
  cache: true,
};

module.exports = (customConfig = {}) => {
  return Object.assign({}, customConfig, {
    webpack(config, context, next) {
      const { isServer, env } = context;
      const isDev = env === 'development';

      const { cssPluginOptions } = customConfig;
      const pluginOptions = {
        ...defaultOptions,
        ...(cssPluginOptions || {}),
        cssLoader: {
          ...defaultOptions.cssLoader,
          ...(cssPluginOptions.cssLoader || {}),
        },
      };

      // enable ISL only available if user set extract css to false and vice versa
      // user has to choose between Isomoprhic style loader or extract css
      // since enabling both css in SSR and CSR using text css doesn't make sense
      if (pluginOptions.enableISL && pluginOptions.extractCss) {
        console.log(
          chalk.bgRed('\n\nERROR'),
          chalk.red.underline.bold('[@airy/maleo-css-plugin]'),
          chalk.red(
            '\nCannot enable both Isomorphic Style Loader and Extract CSS options, you have to choose either one!\n\n',
          ),
        );
        throw new Error();
      }

      const cssLoader = {
        loader: require.resolve('css-loader'),
        options: pluginOptions.cssLoader,
      };

      const styleLoader = !isServer && {
        loader: require.resolve('style-loader'),
      };

      // Extract CSS into css file, optimizes, and minimize it
      // Only runs in production environment, due to no HOT reload support yet
      // For development we will still use style-loader
      if (!isDev && pluginOptions.extractCss) {
        const MiniCssExtractPlugin = require('mini-css-extract-plugin');
        const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

        const { extractCss } = pluginOptions;
        const extractCssOptions =
          typeof extractCss === 'object'
            ? { ...defaultExtractCssOptions, ...extractCss }
            : defaultExtractCssOptions;

        // if user opt for caching [default] and they haven't add '[contenthash]' to the filename
        // then we automatically append the '[contenthash]' for them
        if (extractCssOptions.cache && !~extractCssOptions.filename.indexOf('[contenthash]')) {
          extractCssOptions.filename = extractCssOptions.filename.replace(
            /\.css$/,
            '.[contenthash].css',
          );
          extractCssOptions.chunkFilename = extractCssOptions.chunkFilename.replace(
            /\.css$/,
            '.[contenthash].css',
          );
        }

        // minifier for css files
        config.optimization = {
          ...config.optimization,
          minimizer: [...(config.optimization.minimizer || []), new OptimizeCSSAssetsPlugin()],
        };

        if (extractCssOptions.singleCssFile && !isServer) {
          config.optimization = {
            ...config.optimization,
            splitChunks: {
              ...(config.optimization.splitChunks || {}),
              cacheGroups: {
                ...(config.optimization.splitChunks.cacheGroups || {}),
                styles: {
                  name: 'style',
                  test: /\.css$/,
                  chunks: 'all',
                  enforce: true,
                },
              },
            },
          };
        }

        // Multiple CSS File utilizes chunk filename for optimization
        // While Single CSS File uses filename therefore we need to set chunkFilename to false
        !isServer &&
          config.plugins.push(
            new MiniCssExtractPlugin({
              filename: extractCssOptions.filename,
              chunkFilename: !extractCssOptions.singleCssFile && extractCssOptions.chunkFilename,
            }),
          );

        config.module.rules.push({
          test: /\.css/,
          use: [
            !isServer && {
              loader: MiniCssExtractPlugin.loader,
              options: {
                publicPath: extractCssOptions.publicPath,
              },
            },
            cssLoader,
          ].filter(Boolean),
        });
      } else if (pluginOptions.enableISL) {
        config.module.rules.push({
          test: /\.css$/,
          use: [require.resolve('isomorphic-style-loader'), cssLoader].filter(Boolean),
        });
      } else {
        // default config
        config.module.rules.push({
          test: /\.css$/,
          use: [styleLoader, cssLoader],
        });
      }

      return next(customConfig);
    },
  });
};
