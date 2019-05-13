// tslint:disable: no-console

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
import compression from 'compression';
import zlib from 'zlib';
import path from 'path';
import helmet from 'helmet';
import * as http from 'http';

import { IOptions } from '@interfaces/server';
import { BUILD_DIR, SERVER_ASSETS_ROUTE, CLIENT_BUILD_DIR } from '@constants/index';
import { render } from './render';

export class Server {
  public app: Express = express();
  protected server: http.Server;
  middlewares: any[] = [];
  options: IOptions;

  static init = (options: IOptions) => {
    return new Server(options);
  };

  constructor(options: IOptions) {
    const defaultOptions = {
      assetDir: options.assetDir || path.resolve('.', BUILD_DIR, CLIENT_BUILD_DIR),
      port: options.port || 8080,
      runHandler: options.runHandler || this.defaultHandler,
    } as IOptions;

    this.options = defaultOptions;
  }

  run = async () => {
    await this.setupExpress();

    this.server = this.app.listen(this.options.port, this.options.runHandler);
    return this.server;
  };

  applyExpressMiddleware: ApplicationRequestHandler<Express.Application> = (...handlers) => {
    this.middlewares.push(handlers);

    return this.app;
  };

  routeHandler = async (req: Request, res: Response) => {
    const html = await render({
      req,
      res,
      dir: this.options.assetDir as string,
    });

    res.send(html);
  };

  faviconHandler = async (req: Request, res: Response) => {
    res.send('favicon.ico');
  };

  private setupExpress = async () => {
    // Set Compression
    process.env.NODE_ENV !== 'development' && this.setupCompression(this.app);

    // Set secure server
    this.setupSecureServer(this.app);

    // Set static assets route handler
    this.setAssetsStaticRoute(this.app);

    // Applying user's middleware
    // middleware need to be applied after static assets serving
    // due to issues such as dev middleware for serving an outdated asset from it's memory-fs system
    this.middlewares.map((args) => this.app.use(...args));

    // Set favicon handler
    this.app.use('/favicon.ico', this.faviconHandler);

    // Set route handler
    this.app.use(this.routeHandler);
  };

  private setAssetsStaticRoute = (app: Express) => {
    // asset serving and caching for 30 days
    // since we use ETAG we don't have to worry user won't get the newest assets
    // by the time we have new build that changes the ETAG, browser will automatically
    // request the file again
    app.use(
      SERVER_ASSETS_ROUTE,
      express.static(this.options.assetDir as string, { maxAge: '30 days' }),
    );
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

  private setupCompression = (app: Express) => {
    const option = {
      filter(req, res) {
        if (req.headers['x-no-compression']) {
          // don't compress responses with this request header
          return false;
        }

        // fallback to standard filter function
        return compression.filter(req, res);
      },
      strategy: zlib.Z_DEFAULT_STRATEGY,
      level: zlib.Z_DEFAULT_COMPRESSION,
    };

    app.use(compression(option));
  };

  protected defaultHandler = () => {
    console.log('[Server] is running on port :' + this.options.port);
  };
}

export default Server;
