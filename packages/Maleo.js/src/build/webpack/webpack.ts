// tslint:disable:no-console

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
import nodeExternals from './utils/webpackNodeExternals';

// Other Webpack Plugins
import WebpackBar from 'webpackbar';
import CaseInsensitivePathPlugin from 'case-sensitive-paths-webpack-plugin';
import FriendlyError from 'friendly-errors-webpack-plugin';
import RequireCacheHMR from './plugins/require-cache-hmr';
import CleanPlugin from 'clean-webpack-plugin';

import {
  REACT_LOADABLE_MANIFEST,
  USER_CUSTOM_CONFIG,
  SERVER_ENTRY_NAME,
  CLIENT_ENTRY_NAME,
  BUILD_DIR,
  RUNTIME_CHUNK_FILE,
  SERVER_ASSETS_ROUTE,
  MALEO_PROJECT_ROOT_NODE_MODULES,
  PROJECT_ROOT_NODE_MODULES,
  ROUTES_ENTRY_NAME,
} from '@constants/index';
import {
  Context,
  CustomConfig,
  BuildContext,
  WebpackCustomConfigCallback,
} from '@interfaces/build/IWebpackInterfaces';
import { requireRuntime } from '@utils/require';
import { fileExist } from '@utils/index';

// Default Config if user doesn't have maleo.config.js
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
  ].map((fn) => fn.call(this, buildContext, customConfig));

  /**
   * Base Config
   */
  let baseConfigs: Configuration = {
    name,
    entry,
    context: buildContext.projectDir,
    mode,
    devtool: isDev || sourceMaps ? 'cheap-module-source-map' : false,
    cache,
    bail: true,
    performance: { hints: false },
    resolve: {
      extensions: ['.js', '.jsx', '.json'],
      alias,
      symlinks: true,
      modules: [
        MALEO_PROJECT_ROOT_NODE_MODULES,
        PROJECT_ROOT_NODE_MODULES,
        'node_modules',
        ...nodePathList, // Support for NODE_PATH environment variable
      ],
    },
    resolveLoader: {
      modules: [
        MALEO_PROJECT_ROOT_NODE_MODULES,
        'node_modules',
        path.join(__dirname, '..', 'loaders'), // The loaders Maleo provides
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
    // required on server bundle
    const whitelist = [
      /webpack[/\\]hot[/\\](signal|poll)/,
      /react[/\\]/,
      /@airy[/\\]maleo/,
      /@babel[/\\]runtime[/\\]/,
      /@babel[/\\]runtime-corejs2[/\\]/,
    ];

    baseConfigs = {
      ...baseConfigs,

      // Extract all server node_modules from maleo's project and client's
      externals: [
        nodeExternals({
          modulesFromFile: {
            fileName: require.resolve('~/package.json'),
          },
          whitelist,
        }),
        nodeExternals({
          modulesFromFile: {
            fileName: path.join(buildContext.projectDir, 'package.json'),
          },
          whitelist,
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
export const getDefaultEntry = (
  context: BuildContext,
  customConfig: CustomConfig,
): Configuration['entry'] => {
  const { isServer, projectDir, isDev } = context;

  const { routes, document, wrap, app } = getStaticEntries(context, customConfig);

  if (isServer) {
    const customServerExist = fileExist(projectDir, 'server');
    const serverEntry = customServerExist
      ? path.join(projectDir, SERVER_ENTRY_NAME)
      : path.resolve(__dirname, '../../../lib/default/_server.js');

    return {
      server: [isDev && 'webpack/hot/signal', serverEntry].filter(Boolean) as string[],
      routes,
      document,
      wrap,
      app,
    };
  }

  const customClientExist = fileExist(projectDir, path.join(projectDir, 'client'));
  const clientEntry = customClientExist
    ? path.join(projectDir, CLIENT_ENTRY_NAME)
    : path.resolve(__dirname, '../../../lib/default/_client.js');

  return {
    routes: `maleo-register-loader?page=routes&absolutePagePath=${routes}!`,
    wrap: `maleo-register-loader?page=wrap&absolutePagePath=${wrap}!`,
    app: `maleo-register-loader?page=app&absolutePagePath=${app}!`,
    main: [clientEntry].filter(Boolean) as string[],
  };
};

/**
 * Setting Up Default Optimizations
 */
export const getDefaultOptimizations = (
  context: BuildContext,
  customConfig: CustomConfig,
): Configuration['optimization'] => {
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
export const getDefaultRules = (
  context: BuildContext,
  customConfig: CustomConfig,
): RuleSetRule[] => {
  return [
    {
      test: /\.jsx?$/,
      exclude: /node_modules/,
      use: ['maleo-babel-loader'],
    },
  ];
};

/**
 * Setting up Default Plugins
 */
export const getDefaultPlugins = (
  context: BuildContext,
  customConfig: CustomConfig,
): Configuration['plugins'] => {
  const { isDev, projectDir, publicPath, env, isServer, analyzeBundle, name } = context;

  // To clean up server HMR files
  const cleanUpFiles = ['*.hot-update.*'].map((p) =>
    isServer ? path.join(BUILD_DIR, p) : path.join(BUILD_DIR, 'client', p),
  );

  const commonPlugins: Configuration['plugins'] =
    ([
      new CaseInsensitivePathPlugin(), // Fix OSX case insensitive

      // Common Plugins
      new HashedModuleIdsPlugin(),
      isDev && new FriendlyError(),
      new WebpackBar({
        name,
      }),

      new DefinePlugin({
        WEBPACK_PUBLIC_PATH: JSON.stringify(publicPath),
        __DEV__: isDev,
        __ENV__: JSON.stringify(env),
        __IS_SERVER__: isServer,
      }),

      // Commented due to issue with WDM and WHM
      // details: https://github.com/mzgoddard/hard-source-webpack-plugin/issues/416
      // new HardSourcePlugin({
      //   cacheDirectory: path.join(
      //     projectDir,
      //     `node_modules/.cache/hard-source/${isServer ? 'server' : 'client'}/[confighash]`,
      //   ),
      //   cachePrune: {
      //     // Caches younger than `maxAge` are not considered for deletion. They must
      //     // be at least this (default: 2 days) old in milliseconds.
      //     maxAge: 2 * 24 * 60 * 60 * 1000,
      //     // All caches together must be larger than `sizeThreshold` before any
      //     // caches will be deleted. Together they must be at least this
      //     // (default: 50 MB) big in bytes.
      //     sizeThreshold: 50 * 1024 * 1024,
      //   },

      //   environmentHash: {
      //     root: projectDir,
      //     directories: [],
      //     files: ['package-lock.json', 'yarn.lock'],
      //   },

      //   info: {
      //     mode: env,
      //     level: 'log',
      //   },
      // }),

      // Setting up Development Plugins
      isDev && new RequireCacheHMR(),

      // HMR
      isDev && new HotModuleReplacementPlugin(),
      isDev && new NoEmitOnErrorsPlugin(),

      // Bundled Stats
      new StatsWriterPlugin({
        isDev,
      }),

      isDev &&
        new CleanPlugin(cleanUpFiles, {
          root: projectDir,
          verbose: true,
          watch: true,
          exclude: ['server.js'],
          beforeEmit: true,
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

        isDev &&
          new HardSourcePlugin({
            cacheDirectory: path.join(
              projectDir,
              `node_modules/.cache/hard-source/server/[confighash]`,
            ),
            cachePrune: {
              // Caches younger than `maxAge` are not considered for deletion. They must
              // be at least this (default: 2 days) old in milliseconds.
              maxAge: 2 * 24 * 60 * 60 * 1000,
              // All caches together must be larger than `sizeThreshold` before any
              // caches will be deleted. Together they must be at least this
              // (default: 50 MB) big in bytes.
              sizeThreshold: 50 * 1024 * 1024,
            },

            environmentHash: {
              root: projectDir,
              directories: [],
              files: ['package-lock.json', 'yarn.lock'],
            },

            info: {
              mode: env,
              level: 'log',
            },
          }),
      ].filter(Boolean) as Configuration['plugins']) || [];

    return [...commonPlugins, ...serverPlugins];
  }

  const clientPlugins: Configuration['plugins'] =
    ([
      new ReactLoadablePlugin({
        filename: REACT_LOADABLE_MANIFEST,
      }),

      analyzeBundle && new BundleAnalyzerPlugin(),
    ].filter(Boolean) as Configuration['plugins']) || [];

  return [...clientPlugins, ...commonPlugins];
};

/**
 * Setting Up Default Output
 */
export const getDefaultOutput = (
  context: BuildContext,
  customConfig: CustomConfig,
): Configuration['output'] => {
  const { isServer, projectDir, buildDirectory, publicPath, isDev } = context;

  if (isServer) {
    return {
      filename: '[name].js',
      path: path.resolve(projectDir, buildDirectory),

      library: '[name]',
      libraryTarget: 'commonjs2',
    };
  }

  return {
    path: path.resolve(projectDir, buildDirectory, 'client'),
    publicPath,

    chunkFilename: isDev ? '[name].js' : '[name]-[hash].js',
    filename: isDev ? '[name].js' : '[name]-[hash].js',
    library: '[name]',

    // hotUpdateChunkFilename: 'hot/hot-update.js',
    // hotUpdateMainFilename: 'hot/hot-update.json',
  };
};

/**
 * Load User Config with file name USER_CUSTOM_CONFIG (maleo.config.js)
 */
export const loadUserConfig = (dir: string, quiet?: boolean): CustomConfig => {
  const cwd: string = path.resolve(dir);
  const userConfigPath: string = path.resolve(cwd, USER_CUSTOM_CONFIG);
  try {
    const userConfig = requireRuntime(userConfigPath);

    if (userConfig !== undefined) {
      // tslint:disable-next-line:no-unused-expression quotemark
      !quiet && console.log("[Webpack] Using user's config");
      return {
        ...defaultUserConfig,
        ...userConfig,
      };
    }

    return defaultUserConfig;
  } catch (err) {
    if (err.code !== 'MODULE_NOT_FOUND') {
      // tslint:disable-next-line:no-unused-expression
      !quiet && console.log('[Webpack] Using Default Config');
    }
    return defaultUserConfig;
  }
};

/**
 * Get Static Entries
 * Read from maleo.config.js, if the config not found Maleo will try to search user's from default directory
 * If file not found then Maleo will use it's default statics
 */
const getStaticEntries = (context: BuildContext, config: CustomConfig) => {
  const { projectDir } = context;
  const { customDocument, customWrap, customApp, routes: customRoutes } = config;

  const defaultDocument = path.resolve(__dirname, '../../../lib/render/_document.js');
  const defaultWrap = path.resolve(__dirname, '../../../lib/render/_wrap.js');
  const defaultApp = path.resolve(__dirname, '../../../lib/render/_app.js');

  const defaultUserRoutes = path.join(projectDir, ROUTES_ENTRY_NAME);
  const defaultUserDocument = path.join(projectDir, '_document.jsx');
  const defaultUserWrap = path.join(projectDir, '_wrap.jsx');
  const defaultUserApp = path.join(projectDir, '_app.jsx');

  const cRoutes = customRoutes && path.join(projectDir, customRoutes as string);
  const cDoc = customDocument && path.join(projectDir, customDocument as string);
  const cWrap = customWrap && path.join(projectDir, customWrap as string);
  const cApp = customApp && path.join(projectDir, customApp as string);

  const routes = cRoutes || defaultUserRoutes;

  const document =
    cDoc || fileExist(projectDir, '_document') ? defaultUserDocument : defaultDocument;

  const wrap = cWrap || fileExist(projectDir, '_wrap') ? defaultUserWrap : defaultWrap;

  const app = cApp || fileExist(projectDir, '_app') ? defaultUserApp : defaultApp;

  return {
    routes,
    document,
    wrap,
    app,
  };
};
