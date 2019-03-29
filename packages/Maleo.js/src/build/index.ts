// tslint:disable:no-console

import webpack, { Configuration } from 'webpack';

import { createWebpackConfig, loadUserConfig } from './webpack/webpack';

import { IBuildOptions } from '@interfaces/build/IBuildOptions';
import { Context } from '@interfaces/build/IWebpackInterfaces';

export const getConfigs = (options: IBuildOptions): Configuration[] => {
  const { env, buildType } = options;

  const context: Context = {
    env,
    projectDir: process.cwd(),
  };

  const userConfig = loadUserConfig(context.projectDir);
  const clientConfig = createWebpackConfig({ isServer: false, ...context }, userConfig);
  const serverConfig = createWebpackConfig({ isServer: true, ...context }, userConfig);

  if (buildType === 'server') {
    return [serverConfig];
  }

  if (buildType === 'client') {
    return [clientConfig];
  }

  return [clientConfig, serverConfig];
};

export const build = (options: IBuildOptions) => {
  compile(getConfigs(options), options);
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
      if (typeof callback === 'function') {
        return callback(err, stats);
      }

      if (err || stats.hasErrors()) {
        console.log(
          'Webpack compile failed! Error:',
          err || stats.toString({ colors: true, all: false, errors: true, errorDetails: true }),
        );
        return;
      }

      console.log(
        stats.toJson({
          assets: true,
        }),
      );
    });
  }
};
