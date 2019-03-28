/**
 * Polyfill
 */
import 'es6-promise';
import 'isomorphic-fetch';
/**
 * Polyfill
 */

import express, { Express, Request, Response } from 'express';
import { ApplicationRequestHandler } from 'express-serve-static-core';
import path from 'path';
import helmet from 'helmet';

import { IOptions } from '@interfaces/server/IOptions';

import { render } from './render';
import { BUILD_DIR, SERVER_ASSETS_ROUTE } from '@constants/index';
import { requireRuntime } from '@utils/require';
import { AsyncRouteProps } from '@interfaces/render/IRender';

export class Server {
  app: Express;
  middlewares: any[] = [];
  options: IOptions;

  static init = (options: IOptions) => {
    return new Server(options);
  };

  constructor(options: IOptions) {
    const defaultOptions = {
      assetDir: path.resolve('.', BUILD_DIR, 'client'),
      routes: requireRuntime(path.resolve('.', BUILD_DIR, 'routes.js')) as AsyncRouteProps[],
      port: 8080,
      ...options,
    } as IOptions;

    this.options = defaultOptions;
    this.app = express();
  }

  run = async (handler) => {
    await this.setupExpress();

    return this.app.listen(this.options.port, handler);
  };

  applyExpressMiddleware: ApplicationRequestHandler<Express.Application> = (...handlers) => {
    this.middlewares.push(handlers);

    return this.app;
  };

  routeHandler = async (req: Request, res: Response) => {
    const html = await render({ req, res, dir: this.options.assetDir });

    res.send(html);
  };

  faviconHandler = async (req: Request, res: Response) => {
    res.send('favicon.ico');
  };

  private setupExpress = async () => {
    // Setup for development HMR, etc
    if (__DEV__) {
      this.setupDevServer(this.app);
    }

    // Set secure server
    this.setupSecureServer(this.app);

    // Set static assets route handler
    this.setAssetsStaticRoute(this.app);

    // Applying user's middleware
    this.middlewares.map((args) => this.app.use(...args));

    // Set favicon handler
    this.app.use('/favicon.ico', this.faviconHandler);

    // Set route handler
    this.app.use(this.routeHandler);
  };

  private setAssetsStaticRoute = (app: Express) => {
    // asset caching
    app.use(SERVER_ASSETS_ROUTE, (req, res, next) => {
      res.set('Cache-Control', 'public, max-age=60');
      next();
    });

    // asset serving
    app.use(SERVER_ASSETS_ROUTE, express.static(this.options.assetDir as string));
  };

  private setupSecureServer = (app: Express) => {
    // Header for XSS protection, etc
    app.use(helmet());

    // Header for CSP
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
    app.use(function contentSecurityPolicy(req, res, next) {
      res.setHeader('Content-Security-Policy', `script-src 'self'`);
      next();
    });
  };

  private setupDevServer = (app: Express) => {
    // Webpack Dev Server
    const { getConfigs } = requireRuntime(path.resolve(__dirname, '../build/index'));
    const webpack = requireRuntime('webpack');

    const configs = getConfigs({ env: 'development' });
    const multiCompiler = webpack(configs);

    const [clientCompiler] = multiCompiler.compilers;

    const ignored = [/\.git/, /\.maleo\//, /node_modules/];
    const wdmOptions = {
      stats: false,
      serverSideRender: true,
      hot: true,
      writeToDisk: true,
      publicPath: clientCompiler.options.output.publicPath || WEBPACK_PUBLIC_PATH,
      watchOptions: { ignored },
    }; // @ts-ignore
    app.use(requireRuntime('webpack-dev-middleware')(multiCompiler, wdmOptions));

    const whmOptions = {
      // tslint:disable-next-line:no-console
      log: console.log,
      path: '/__webpack_hmr',
      heartbeat: 10 * 10000,
    };
    app.use(requireRuntime('webpack-hot-middleware')(clientCompiler, whmOptions));
  };
}
