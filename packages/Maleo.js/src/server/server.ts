/**
 * Polyfill
 */
import 'es6-promise';
import 'isomorphic-fetch';
/**
 * Polyfill
 */

import express, { Express, Request, Response } from 'express';
import path from 'path';
import Loadable from 'react-loadable';
import helmet from 'helmet';

import { IOptions } from '@interfaces/server/IOptions';

import { render } from './render';
import { BUILD_DIR, SERVER_ASSETS_ROUTE } from '@constants/index';
import { requireRuntime } from '@utils/require';
import { AsyncRouteProps } from '@interfaces/render/IRender';

export class Server {
  app: Express;
  options: IOptions;

  static init = (options: IOptions) => {
    return new Server(options);
  };

  constructor(options: IOptions) {
    const defaultOptions = {
      assetDir: path.resolve('.', BUILD_DIR, 'client'),
      routes: requireRuntime(path.resolve('.', BUILD_DIR, 'routes.js')) as AsyncRouteProps[],
      port: 8080,

      _document: requireRuntime(path.resolve('.', BUILD_DIR, 'document.js')),
      _wrap: requireRuntime(path.resolve('.', BUILD_DIR, 'wrap.js')),
      _app: requireRuntime(path.resolve('.', BUILD_DIR, 'app.js')),

      ...options,
    } as IOptions;

    this.options = defaultOptions;

    this.setupExpress();
  }

  run = (handler) => {
    // return this.app.listen(this.options.port, handler);
    return Loadable.preloadAll().then(() => {
      this.app.listen(this.options.port, handler);
    });
  };

  applyExpressMiddleware = (middleware: express.RequestHandler) => {
    this.app.use(middleware);
  };

  routeHandler = async (req: Request, res: Response) => {
    const html = await render({
      req,
      res,
      dir: this.options.assetDir,
      routes: this.options.routes,
      Document: this.options._document,
      App: this.options._app,
      Wrap: this.options._wrap,
    });

    res.send(html);
  };

  faviconHandler = async (req: Request, res: Response) => {
    res.send('favicon.ico');
  };

  private setupExpress = () => {
    this.app = express();

    // Setup for development HMR, etc
    if (__DEV__) {
      this.setupDevServer(this.app);
    }

    // Header for XSS protection, etc
    this.app.use(helmet());

    // Set static assets route handler
    this.setAssetsStaticRoute(this.app);

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
      writeToDisk: (filepath) => {
        return /\.json$/.test(filepath);
      },
      // @ts-ignore
      publicPath: clientCompiler.options.output.publicPath || WEBPACK_PUBLIC_PATH,
      watchOptions: { ignored },
    };
    app.use(requireRuntime('webpack-dev-middleware')(clientCompiler, wdmOptions));

    const whmOptions = {
      // tslint:disable-next-line:no-console
      log: console.log,
      path: '/__webpack_hmr',
      heartbeat: 10 * 10000,
    };
    app.use(requireRuntime('webpack-hot-middleware')(clientCompiler, whmOptions));
  };
}
