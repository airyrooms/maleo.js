import path from 'path';
import {
  Configuration,
  RuleSetRule,
  HashedModuleIdsPlugin,
  DefinePlugin,
  HotModuleReplacementPlugin,
  NoEmitOnErrorsPlugin,
  BannerPlugin,
} from 'webpack';

// Webpack Optimizations Plugin
import TerserPlugin from 'terser-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import HardSourcePlugin from 'hard-source-webpack-plugin';

// Webpack required plugins
import { StatsWriterPlugin } from 'webpack-stats-plugin';
import { ReactLoadablePlugin } from './plugins/react-loadable';
import nodeExternals from 'webpack-node-externals';

// Other Webpack Plugins
import WebpackBar from 'webpackbar';
import CaseInsensitivePathPlugin from 'case-sensitive-paths-webpack-plugin';

import {
  REACT_LOADABLE_MANIFEST,
  USER_CUSTOM_CONFIG,
  SERVER_ENTRY_NAME,
  CLIENT_ENTRY_NAME,
  BUILD_DIR,
  RUNTIME_CHUNK_FILE,
  SERVER_ASSETS_ROUTE,
  ZONES_PROJECT_ROOT_NODE_MODULES,
} from '@src/constants';
import {
  Context,
  CustomConfig,
  BuildContext,
  WebpackCustomConfigCallback,
} from '@interfaces/build/IWebpackInterfaces';
import { requireRuntime } from '@utils/require';

// Default Config if user doesn't have zones.config.js
const defaultUserConfig: CustomConfig = {
  webpack: undefined,
  cache: true,
  sourceMaps: true,
  analyzeBundle: false,
  buildDir: BUILD_DIR,
};

export const createWebpackConfig = (context: Context, customConfig: CustomConfig) => {
  const { env, isServer } = context;
  const {
    cache,
    buildDir,
    webpack,
    analyzeBundle,
    publicPath: _publicPath,
    sourceMaps,
    alias: _alias,
  } = customConfig;

  const isDev = env === 'development' ? true : false;

  const buildDirectory = buildDir || BUILD_DIR;
  const name = isServer ? 'server' : 'client';
  const mode = isDev ? 'development' : 'production';
  const publicPath = _publicPath || SERVER_ASSETS_ROUTE;
  const alias = _alias || undefined;

  // Support for NODE_PATH
  const nodePathList = (process.env.NODE_PATH || '')
    .split(process.platform === 'win32' ? ';' : ':')
    .filter((p) => !!p);

  const buildContext: BuildContext = {
    ...context,
    isDev,
    publicPath,
    analyzeBundle,
    buildDirectory,
    name,
  };

  const [entry, optimization, rules, plugins, output] = [
    getDefaultEntry,
    getDefaultOptimizations,
    getDefaultRules,
    getDefaultPlugins,
    getDefaultOutput,
  ].map((fn) => fn.call(this, buildContext));

  /**
   * Base Config
   */
  let baseConfigs: Configuration = {
    name,
    entry,
    mode,
    devtool: isDev || sourceMaps ? 'cheap-module-source-map' : false,
    cache,
    bail: true,
    performance: { hints: false },
    resolve: {
      extensions: ['.js', '.jsx', '.json'],
      alias,
      modules: [
        ZONES_PROJECT_ROOT_NODE_MODULES,
        'node_modules',
        ...nodePathList, // Support for NODE_PATH environment variable
      ],
    },
    resolveLoader: {
      modules: [
        ZONES_PROJECT_ROOT_NODE_MODULES,
        'node_modules',
        path.join(__dirname, '..', 'loaders'), // The loaders Zones provides
        ...nodePathList, // Support for NODE_PATH environment variable
      ],
    },
    optimization,
    target: isServer ? 'node' : 'web',
    module: {
      rules,
    },
    plugins,
    output,
  };

  if (isServer) {
    baseConfigs = {
      ...baseConfigs,

      // Extract all server node_modules from bundles except React
      externals: [
        nodeExternals({
          whitelist: [/react/],
        }),
      ],

      node: {
        // Keep __dirname relative to file not root project
        __dirname: true,
      },
    };
  }

  /**
   * Check Plugins or User's Custom Webpack Config
   */
  if (typeof webpack === 'function') {
    const next: WebpackCustomConfigCallback = (cc) => {
      if (typeof cc.webpack === 'function') {
        return cc.webpack(baseConfigs, buildContext, next);
      }

      return baseConfigs;
    };

    // Alter Base Config
    webpack(baseConfigs, context, next);
  }

  return baseConfigs;
};

/**
 * Setting Up Default Entry
 */
export const getDefaultEntry = (context: BuildContext): Configuration['entry'] => {
  const { isServer, projectDir } = context;

  if (isServer) {
    return {
      server: path.join(projectDir, SERVER_ENTRY_NAME),
    };
  }

  return {
    main: [
      'webpack-hot-middleware/client?name=client',
      'react-hot-loader/patch',
      path.join(projectDir, CLIENT_ENTRY_NAME),
    ],
  };
};

/**
 * Setting Up Default Optimizations
 */
export const getDefaultOptimizations = (context: BuildContext): Configuration['optimization'] => {
  const { isServer, isDev } = context;

  const commonOptimizations: Configuration['optimization'] = {
    noEmitOnErrors: true,
  };

  if (isServer) {
    return {
      ...commonOptimizations,
      splitChunks: false,
      minimize: false,
    };
  }

  let clientOptimizations: Configuration['optimization'];
  clientOptimizations = {
    ...commonOptimizations,

    runtimeChunk: {
      name: RUNTIME_CHUNK_FILE,
    },
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        default: false,
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          // test: /node_modules\/(?!((.*)webpack(.*))).*/,
          name(module) {
            // get the name. E.g. node_modules/packageName/not/this/part.js
            // or node_modules/packageName
            const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];

            // npm package names are URL-safe, but some servers don't like @ symbols
            return `npm.${packageName.replace('@', '')}`;
          },
        },
      },
    },
  };

  if (!isDev) {
    clientOptimizations = {
      ...clientOptimizations,

      minimize: true,
      minimizer: [
        new TerserPlugin({
          test: /\.js$/,
          cache: true,
          parallel: true,
          terserOptions: {
            ecma: undefined,
            warnings: false,
            parse: {},
            compress: {},
            mangle: true, // Note `mangle.properties` is `false` by default.
            module: false,
            output: null,
            toplevel: false,
            nameCache: null,
            ie8: false,
            keep_classnames: undefined,
            keep_fnames: false,
            safari10: false,
          },
        }),
      ],

      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,

          commons: {
            name: 'commons',
            chunks: 'all',
            minChunks: 2,
          },
          react: {
            name: 'commons',
            chunks: 'all',
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          },
        },
      },
    };
  }

  return clientOptimizations;
};

/**
 * Setting Up Default Rules
 */
export const getDefaultRules = (context: BuildContext): RuleSetRule[] => {
  return [
    {
      test: /\.jsx?/,
      exclude: /node_modules/,
      use: ['zones-babel-loader'],
    },
  ];
};

/**
 * Setting up Default Plugins
 */
export const getDefaultPlugins = (context: BuildContext): Configuration['plugins'] => {
  const { isDev, projectDir, publicPath, env, isServer, analyzeBundle, name } = context;

  const commonPlugins: Configuration['plugins'] =
    ([
      new CaseInsensitivePathPlugin(), // Fix OSX case insensitive

      // Common Plugins
      new HashedModuleIdsPlugin(),
      new WebpackBar({
        name,
      }),

      new DefinePlugin({
        WEBPACK_PUBLIC_PATH: JSON.stringify(publicPath),
        __DEV__: isDev,
        __ENV__: JSON.stringify(env),
      }),

      // Setting up Development Plugins
      // Commented due to issue with WDM and WHM
      // details: https://github.com/mzgoddard/hard-source-webpack-plugin/issues/416
      isDev &&
        new HardSourcePlugin({
          cacheDirectory: path.join(
            projectDir,
            `node_modules/.cache/hard-source/${isServer ? 'server' : 'client'}/[confighash]`,
          ),

          environmentHash: {
            root: projectDir,
            directories: [],
            files: ['package-lock.json', 'yarn.lock'],
          },

          info: {
            mode: 'none',
            level: 'log',
          },
        }),
    ].filter(Boolean) as Configuration['plugins']) || [];

  // Setting Up Server Plugins
  if (isServer) {
    const serverPlugins: Configuration['plugins'] =
      ([
        // Add sourcemap support for node.js for debugging purposes
        // either on production or development
        new BannerPlugin({
          banner: 'require("source-map-support").install();',
          raw: true,
          entryOnly: false,
        }),

        // new RequireCacheHMR(),
      ].filter(Boolean) as Configuration['plugins']) || [];

    return [...commonPlugins, ...serverPlugins];
  }

  const clientPlugins: Configuration['plugins'] =
    ([
      new ReactLoadablePlugin({
        filename: REACT_LOADABLE_MANIFEST,
      }),

      analyzeBundle && new BundleAnalyzerPlugin(),

      // Bundled Stats
      new StatsWriterPlugin({
        isDev,
      }),

      new HotModuleReplacementPlugin(),
      new NoEmitOnErrorsPlugin(),
    ].filter(Boolean) as Configuration['plugins']) || [];

  return [...clientPlugins, ...commonPlugins];
};

/**
 * Setting Up Default Output
 */
export const getDefaultOutput = (context: BuildContext): Configuration['output'] => {
  const { isServer, projectDir, buildDirectory, publicPath, isDev } = context;

  if (isServer) {
    return {
      filename: '[name].js',
      path: path.resolve(projectDir, buildDirectory),
    };
  }

  return {
    path: path.resolve(projectDir, buildDirectory, 'client'),
    publicPath,

    chunkFilename: isDev ? '[name].js' : '[name]-[contenthash].js',
    filename: isDev ? '[name]' : '[name]-[contenthash]',
    library: '[name]',

    // hotUpdateChunkFilename: 'hot/hot-update.js',
    // hotUpdateMainFilename: 'hot/hot-update.json',
  };
};

/**
 * Load User Config with file name USER_CUSTOM_CONFIG (zones.config.js)
 */
export const loadUserConfig = (dir: string): CustomConfig => {
  const cwd: string = path.resolve(dir);
  const userConfigPath: string = path.resolve(cwd, USER_CUSTOM_CONFIG);
  try {
    const userConfig = requireRuntime(userConfigPath);

    if (userConfig !== undefined) {
      console.log('[Webpack] Using user\'s config');
      return {
        ...defaultUserConfig,
        ...userConfig,
      };
    }

    return defaultUserConfig;
  } catch (err) {
    if (err.code !== 'MODULE_NOT_FOUND') {
      console.log('[Webpack] Using Default Config');
    }
    return defaultUserConfig;
  }
};
