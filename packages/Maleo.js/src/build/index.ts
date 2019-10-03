// tslint:disable:no-console

import webpack, { Configuration } from 'webpack';

import { createWebpackConfig, loadUserConfig } from './webpack/webpack';

import { IBuildOptions } from '@interfaces/build';
import { Context, CustomConfig } from '@interfaces/build';
import { buildStatic } from '@build/static/static';

export const getConfigs = (options: IBuildOptions): Configuration[] => {
  const { env, buildType, minimalBuild, experimentalLazyBuild } = options;

  const context: Context = {
    env,
    projectDir: process.cwd(),
  };

  const userConfig: CustomConfig = loadUserConfig(context.projectDir!);
  const clientConfig = createWebpackConfig({ isServer: false, ...context }, userConfig);
  const serverConfig = createWebpackConfig(
    { isServer: true, ...context, minimalBuild, experimentalLazyBuild },
    userConfig,
  );

  let esmConfig;
  if (userConfig.esModules) {
    esmConfig = createWebpackConfig({ isServer: false, esModules: true, ...context }, userConfig);
  }

  if (buildType === 'server') {
    return [serverConfig];
  }

  if (buildType === 'client') {
    return [clientConfig, esmConfig].filter(Boolean);
  }

  return [clientConfig, serverConfig, esmConfig].filter(Boolean);
};

export const build = (options: IBuildOptions) => {
  compile(getConfigs(options), options);
};

export const exportStatic = (userConfig: CustomConfig) => {
  if (userConfig.staticPages) {
    const { staticPages } = userConfig;
    try {
      console.log('[STATIC] Starting to export static pages');
      buildStatic(staticPages, process.cwd());
    } catch (error) {
      console.log('[STATIC] Error when tried to export static pages, error:', error);
    }
  } else {
    console.log(
      '[STATIC] Static export cannot be done. User did not define static field in maleo config',
    );
  }
};

const compile = (configs: webpack.Configuration[], options: IBuildOptions) => {
  const { env, callback } = options;

  const webpackCompiler = webpack(configs);

  if (env === 'development') {
    webpackCompiler.run((err, stats) => {
      if (err || stats.hasErrors()) {
        console.log(
          'Webpack compile failed! Error:',
          err || stats.toString({ colors: true, all: false, errors: true, errorDetails: true }),
        );

        return;
      }

      if (typeof callback === 'function') {
        return callback(err, stats);
      }
    });
  } else {
    webpackCompiler.run((err: Error, stats: webpack.Stats) => {
      if (err || stats.hasErrors()) {
        console.log(
          'Webpack compile failed! Error:',
          err || stats.toString({ colors: true, all: false, errors: true, errorDetails: true }),
        );
        return;
      }

      if (typeof callback === 'function') {
        return callback(err, stats);
      }

      console.log(
        stats.toJson({
          assets: true,
        }),
      );
    });
  }
};
