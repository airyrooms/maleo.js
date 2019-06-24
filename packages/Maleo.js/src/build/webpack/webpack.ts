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
import { StatsWriterPlugin } from './plugins/stats-writer';
import { ReactLoadablePlugin } from './plugins/react-loadable';
import nodeExternals from './utils/webpackNodeExternals';

// Other Webpack Plugins
import WebpackBar from 'webpackbar';
import CaseInsensitivePathPlugin from 'case-sensitive-paths-webpack-plugin';
import FriendlyError from 'friendly-errors-webpack-plugin';
import RequireCacheHMR from './plugins/require-cache-hmr';

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
  DOCUMENT_ENTRY_NAME,
  WRAP_ENTRY_NAME,
  APP_ENTRY_NAME,
  CLIENT_BUILD_DIR,
  SERVER_BUILD_DIR,
} from '@constants/index';
import {
  Context,
  CustomConfig,
  BuildContext,
  WebpackCustomConfigCallback,
} from '@interfaces/build';
import { fileExist } from './utils';
import { requireRuntime } from '@utils/require';

// Default Config if user doesn't have maleo.config.js
const defaultUserConfig: CustomConfig = {
  webpack: undefined,
  cache: true,
  sourceMaps: true,
  analyzeBundle: false,
  buildDir: BUILD_DIR,
  assetDir: path.resolve('.', BUILD_DIR, CLIENT_BUILD_DIR),
  distDir: path.resolve('.', 'dist'),
};

export const createWebpackConfig = (context: Context, customConfig: CustomConfig) => {
  const { env, isServer, minimalBuild } = context;
  const {
    cache,
    buildDir,
    webpack,
    analyzeBundle,
    publicPath: _publicPath,
    sourceMaps,
    alias: _alias,
    isDev = env === 'development',
    whitelist: customWhitelist = [],
  } = customConfig;

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
    env,
    isDev,
    publicPath,
    analyzeBundle,
    buildDirectory,
    name,
    minimalBuild,
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
      ...customWhitelist,
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
            fileName: path.join(buildContext.projectDir!, 'package.json'),
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
      if (cc && typeof cc.webpack === 'function') {
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
  const { isServer, projectDir = '', isDev, minimalBuild } = context;

  const { routes, document, wrap, app } = getStaticEntries(context, customConfig);

  if (isServer) {
    const customServerExist = fileExist(projectDir, 'server');
    const serverEntry = customServerExist
      ? path.join(projectDir, SERVER_ENTRY_NAME)
      : path.resolve(__dirname, '../../../lib/default/_server.js');

    const serverEntries = {
      server: [isDev && 'webpack/hot/signal', serverEntry].filter(Boolean) as string[],
      routes,
      document,
      wrap,
      app,
    };

    if (minimalBuild) {
      console.log('[Webpack] Running minimal server build');
      return {
        server: serverEntries.server,
      };
    }

    return serverEntries;
  }

  const customClientExist = fileExist(projectDir, path.join(projectDir, 'client'));
  const clientEntry = customClientExist
    ? path.join(projectDir, CLIENT_ENTRY_NAME)
    : path.resolve(__dirname, '../../../lib/default/_client.js');

  return {
    main: [clientEntry].filter(Boolean) as string[],
    routes,
    wrap: `maleo-register-loader?page=wrap&absolutePagePath=${wrap}!`,
    app: `maleo-register-loader?page=app&absolutePagePath=${app}!`,
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
    nodeEnv: false,
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
    runtimeChunk: { name: RUNTIME_CHUNK_FILE },
    splitChunks: {
      chunks: 'async',
      minSize: 30000,
      maxSize: 0,
      minChunks: 1,
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
      name: false,
      cacheGroups: {
        vendors: {
          name: 'vendors',
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
      },
    },
  };

  if (!isDev) {
    clientOptimizations = {
      ...clientOptimizations,
      splitChunks: {
        chunks: 'all',
        name: false,
        minSize: 30000,
        maxSize: 0,
        cacheGroups: {
          default: false,
          vendors: false,
          react: {
            name: 'react',
            chunks: 'all',
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          },
          commons: { name: 'commons', chunks: 'all', minChunks: 2 },
        },
      },
      //   chunks: 'async', // splitChunks: {
      //   cacheGroups: {
      //     default: false,
      //     vendors: {
      //       test: /[\\/]node_modules[\\/]/,
      //       name(module) {
      //         // get the name. E.g. node_modules/packageName/not/this/part.js
      //         // or node_modules/packageName
      //         const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];

      //         // npm package names are URL-safe, but some servers don't like @ symbols
      //         return `npm.${packageName.replace('@', '')}`;
      //       },
      //     },
      //   },
      // },
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
  const { isServer, projectDir = '' } = context;

  return [
    {
      test: /\.jsx?$/,
      exclude: /node_modules/,
      use: ['maleo-babel-loader'],
    },
    // to disable webpack's default json-loader
    // so we need to define our own rules for routes.json
    {
      type: 'javascript/auto',
      test: path.resolve(projectDir, ROUTES_ENTRY_NAME),
      exclude: /node_modules/,
      use: `maleo-routes-split?server=${JSON.stringify(!!isServer)}`,
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
  const {
    isDev,
    projectDir,
    publicPath,
    env,
    isServer,
    analyzeBundle,
    name,
    experimentalLazyBuild,
    minimalBuild,
  } = context;

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
          new DefinePlugin({
            __EXPERIMENTAL_LAZY_BUILD__: JSON.stringify(experimentalLazyBuild),
          }),

        // no need to cache minimal built server
        // only cache during full build
        // caching minimal build causes issue such as when we are using define plugin
        // the definition got cached therefore the value is unpredictable
        !minimalBuild &&
          isDev &&
          new HardSourcePlugin({
            cacheDirectory: path.join(
              projectDir!,
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

      // define environment during build time
      new DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      }),
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
  const { isServer, projectDir = '', buildDirectory, publicPath, isDev } = context;

  const hmr = {
    hotUpdateChunkFilename: 'hot/hot-update.js',
    hotUpdateMainFilename: 'hot/hot-update.json',
  };

  if (isServer) {
    return {
      filename: '[name].js',
      chunkFilename: '[name].js',
      path: path.resolve(projectDir, buildDirectory, SERVER_BUILD_DIR),
      publicPath,

      library: '[name]',
      libraryTarget: 'commonjs2',
      ...hmr,
    };
  }

  return {
    path: path.resolve(projectDir, buildDirectory, CLIENT_BUILD_DIR),
    publicPath,

    chunkFilename: isDev ? '[name].js' : '[name]-[hash].js',
    filename: isDev ? '[name].js' : '[name]-[hash].js',
    library: '[name]',
    ...hmr,
  };
};

/**
 * Load User Config with file name USER_CUSTOM_CONFIG (maleo.config.js)
 */
export const loadUserConfig = (
  dir: string,
  filename: string = USER_CUSTOM_CONFIG,
): CustomConfig => {
  const cwd: string = path.resolve(dir);
  const userConfigPath: string = path.resolve(cwd, filename);

  const cb = (err) => {
    if (!err) {
      return console.log('[MALEO] Using custom maleo configuration');
    }

    if (err.code === 'MODULE_NOT_FOUND') {
      return console.error('[MALEO] Custom configuration not found, using default configuration');
    }
  };

  const userConfig = requireRuntime(userConfigPath, cb);

  return {
    ...defaultUserConfig,
    ...userConfig,
  };
};

/**
 * Get Static Entries
 * Read from maleo.config.js, if the config not found Maleo will try to search user's from default directory
 * If file not found then Maleo will use it's default statics
 */
const getStaticEntries = (context: BuildContext, config: CustomConfig) => {
  const { projectDir = '' } = context;
  const { customDocument, customWrap, customApp, routes: customRoutes } = config;

  const defaultDocument = path.resolve(__dirname, '../../../lib/render/_document.js');
  const defaultWrap = path.resolve(__dirname, '../../../lib/render/_wrap.js');
  const defaultApp = path.resolve(__dirname, '../../../lib/render/_app.js');

  const defaultUserRoutes = path.join(projectDir, ROUTES_ENTRY_NAME);
  const defaultUserDocument = path.join(projectDir, DOCUMENT_ENTRY_NAME);
  const defaultUserWrap = path.join(projectDir, WRAP_ENTRY_NAME);
  const defaultUserApp = path.join(projectDir, APP_ENTRY_NAME);

  const cRoutes = customRoutes && path.join(projectDir, customRoutes as string);
  const cDoc = customDocument && path.join(projectDir, customDocument as string);
  const cWrap = customWrap && path.join(projectDir, customWrap as string);
  const cApp = customApp && path.join(projectDir, customApp as string);

  const routes = cRoutes || defaultUserRoutes;

  const document =
    cDoc || (fileExist(projectDir, '_document') ? defaultUserDocument : defaultDocument);

  const wrap = cWrap || (fileExist(projectDir, '_wrap') ? defaultUserWrap : defaultWrap);

  const app = cApp || (fileExist(projectDir, '_app') ? defaultUserApp : defaultApp);

  return {
    routes,
    document,
    wrap,
    app,
  };
};
