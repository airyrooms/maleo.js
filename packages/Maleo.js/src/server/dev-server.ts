// tslint:disable: no-console

import express, { Request, Response } from 'express';
import { watchFile, unwatchFile, watch } from 'fs';
import path from 'path';
import devMiddleware from 'webpack-dev-middleware';
import hotMiddleware from 'webpack-hot-middleware';

import { Server } from './server';
import { requireRuntime } from '@utils/require';
import { IOptions } from '../interfaces/server/IOptions';
import { render } from './render';
import { RenderParam } from '../interfaces/render/IRender';
import { mapAssets } from './extract-stats';
import { mapStats } from '@build/webpack/plugins/stats-writer';
import {
  USER_CUSTOM_CONFIG,
  DOCUMENT_ENTRY_NAME,
  WRAP_ENTRY_NAME,
  APP_ENTRY_NAME,
} from '../constants';

const ignored = [/\.git/, /\.maleo\//, /node_modules/];

class DevServer extends Server {
  static init = (options: IOptions) => {
    return new DevServer(options);
  };

  memoryStats = null;
  clientWdm;
  serverWdm;
  lazyBuild;
  server;
  watching = [];

  constructor(options: IOptions) {
    super(options);

    this.setupDevelopment();
  }

  routeHandler = async (req: Request, res: Response) => {
    const html = await render({
      req,
      res,
      dir: this.options.assetDir,
      preloadScripts: this.getMemoryPreload,
    });

    res.send(html);
  };

  private reload = async () => {
    this.memoryStats = null;

    this.stop(this.clientWdm);
    this.stop(this.serverWdm);
    this.server.close();

    this.clientWdm = undefined;
    this.serverWdm = undefined;
    this.lazyBuild = undefined;
    this.watching = [];
    this.app = express();

    delete require.cache[path.resolve(__dirname, '../build/index')];
    await this.setupDevelopment();
    this.run(() => console.log('Server rerun'));
  };

  private stop = async (webpackDevMiddleware) => {
    if (webpackDevMiddleware) {
      return new Promise((resolve, reject) => {
        webpackDevMiddleware.close((err) => {
          if (err) {
            return reject(err);
          }

          return resolve();
        });
      });
    }
  };

  private watchingChanges = () => {
    const staticEntries = [DOCUMENT_ENTRY_NAME, APP_ENTRY_NAME, WRAP_ENTRY_NAME].map((entry) =>
      entry.replace(/^(.+)\.(.+)$/, '$1'),
    );

    watch(process.cwd(), (eventType, filename) => {
      console.log(eventType, filename);
      if (eventType === 'rename') {
        console.log(staticEntries.find((entry) => !!~filename.indexOf(entry)));
        if (staticEntries.find((entry) => !!~filename.indexOf(entry))) {
          console.log(
            `\n> Found a change in ${filename}. Restarting the server and development server to apply the effect.`,
          );
          this.reload();
          // console.log('[Dev-Server] Watching for ' + filename + ' changes.');
          // const entry = path.resolve(process.cwd(), filename);
          // watchFile(filename, (curr, prev) => {
          //   if (curr.size > 0 || prev.size > 0) {
          //     unwatchFile(entry);
          //     console.log(
          //       `\n> Found a change in ${filename}. Restarting the server and development server to apply the effect.`,
          //     );
          //     this.reload();
          //   }
          // });
        }
      }
    });
  };

  private setupDevelopment = async () => {
    const webpack = requireRuntime('webpack');
    const { getConfigs } = requireRuntime(path.resolve(__dirname, '../build/index'));

    const [clientConfig, serverConfig] = getConfigs({ env: 'development' });

    if (__EXPERIMENTAL_LAZY_BUILD__) {
      const { LazyBuild } = require('./lazy-development-build');
      this.lazyBuild = new LazyBuild();
      clientConfig.plugins.push(this.lazyBuild.createPlugin());
    }

    const multiCompiler = webpack([clientConfig, serverConfig]);
    const [clientCompiler, serverCompiler] = multiCompiler.compilers;

    this.setupClientDev(clientCompiler);
    this.setupDevServer(serverCompiler);

    this.watchingChanges();
  };

  private setupClientDev = (compiler) => {
    const wdmOptions = {
      stats: false,
      serverSideRender: true,
      hot: true,
      writeToDisk: true,
      lazy: false,
      publicPath: compiler.options.output.publicPath || WEBPACK_PUBLIC_PATH,
      watchOptions: { ignored },
    };

    this.clientWdm = devMiddleware(compiler, wdmOptions);
    if (__EXPERIMENTAL_LAZY_BUILD__) {
      this.applyExpressMiddleware(this.lazyBuild.createMiddleware(this.clientWdm));
    } else {
      this.applyExpressMiddleware(this.clientWdm);
    }

    const whmOptions = {
      // tslint:disable-next-line:no-console
      log: console.log,
      path: '/__webpack_hmr',
      heartbeat: 10 * 10000,
    };

    const whm = hotMiddleware(compiler, whmOptions);
    this.applyExpressMiddleware(whm);
  };

  private setupDevServer = (compiler) => {
    const wdmOptions = {
      stats: false,
      hot: false,
      writeToDisk: true,
      lazy: false,
      watchOptions: { ignored },
    };

    this.serverWdm = devMiddleware(compiler, wdmOptions);
    this.applyExpressMiddleware(this.serverWdm);
  };

  private getMemoryPreload: RenderParam['preloadScripts'] = async (dir, tempArray, context) => {
    // sort preload with main last
    await this.setMemoryStats();
    const memoryStats = mapStats(this.memoryStats, 'assetsByChunkName');

    tempArray = mapAssets(memoryStats);

    const mainIndex = tempArray.findIndex((p) => /main/.test(p.filename));
    return [
      ...tempArray.slice(0, mainIndex),
      ...tempArray.slice(mainIndex + 1),
      tempArray[mainIndex],
    ];
  };

  private setMemoryStats = async () => {
    const wdmPreStats = await this.waitUntilValid(this.clientWdm);
    this.memoryStats = wdmPreStats.toJson();
  };

  private waitUntilValid = (webpackDevMiddleware) => {
    return new Promise((resolve) => {
      webpackDevMiddleware.waitUntilValid(resolve);
    });
  };
}

export { DevServer as Server };
export default DevServer;
