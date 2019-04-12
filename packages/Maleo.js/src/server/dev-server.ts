// tslint:disable: no-console

import express, { Request, Response } from 'express';
import { watch } from 'fs';
import path from 'path';
import devMiddleware from 'webpack-dev-middleware';
import hotMiddleware from 'webpack-hot-middleware';

import { Server } from './server';
import { requireRuntime } from '@utils/require';
import { IOptions } from '../interfaces/server/IOptions';
import { render } from './render';
import { RenderParam, ServerAssets } from '../interfaces/render/IRender';
import { mapAssets } from './extract-stats';
import { mapStats } from '@build/webpack/plugins/stats-writer';
import {
  DOCUMENT_ENTRY_NAME,
  WRAP_ENTRY_NAME,
  APP_ENTRY_NAME,
  BUILD_DIR,
  SERVER_BUILD_DIR,
} from '../constants';

const webpack = requireRuntime('webpack');
const { getConfigs } = requireRuntime(path.resolve(__dirname, '../build/index'));

const ignored = [/\.git/, /\.maleo\//, /node_modules/];

class DevServer extends Server {
  static init = (options: IOptions) => {
    return new DevServer(options);
  };

  clientMemoryStats = null;
  clientWdm: devMiddleware;
  serverWdm: devMiddleware;
  lazyBuild;

  constructor(options: IOptions) {
    super(options);

    this.setupDevelopment();

    this.watchingChanges();
  }

  routeHandler = async (req: Request, res: Response) => {
    const html = await render({
      req,
      res,
      dir: this.options.assetDir,
      preloadScripts: this.getMemoryPreload,
      getServerAssets: this.getServerAssets,
    });

    res.send(html);
  };

  private reload = async () => {
    console.log('[Dev-Server] Reloading...');

    await this.stop(this.serverWdm);
    await this.stop(this.clientWdm);
    this.server.close();

    await this.cleanUpServer();

    await this.setupDevelopment();

    this.server = this.run();
  };

  private cleanUpServer = async () => {
    this.clientMemoryStats = null;
    this.clientWdm = undefined;
    this.serverWdm = undefined;
    this.lazyBuild = undefined;
    this.app = express();
  };

  private stop = async (webpackDevMiddleware) => {
    if (webpackDevMiddleware) {
      return new Promise((resolve) => {
        webpackDevMiddleware.close(resolve);
      });
    }
  };

  // watching for file addition or removal of static entries on root directory of the project
  private watchingChanges = () => {
    const staticEntries = [DOCUMENT_ENTRY_NAME, APP_ENTRY_NAME, WRAP_ENTRY_NAME].map((entry) =>
      entry.replace(/^(.+)\.(.+)$/, '$1'),
    );

    watch(process.cwd(), (eventType, filename) => {
      if (eventType === 'rename') {
        const entryIndex = staticEntries.findIndex((entry) => !!~filename.indexOf(entry));
        if (!!~entryIndex) {
          console.log(
            `\n> Found a change in ${filename}. Restarting the development server to apply the changes.`,
          );
          this.reload();
        }
      }
    });
  };

  private setupDevelopment = async () => {
    const [clientConfig, serverConfig] = getConfigs({ env: 'development' });

    if (__EXPERIMENTAL_LAZY_BUILD__) {
      const { LazyBuild } = require('./lazy-development-build');
      this.lazyBuild = new LazyBuild();
      clientConfig.plugins.push(this.lazyBuild.createPlugin());
    }

    const multiCompiler = webpack([clientConfig, serverConfig]);
    const [clientCompiler, serverCompiler] = multiCompiler.compilers;

    await this.setupClientDev(clientCompiler);
    await this.setupDevServer(serverCompiler);
  };

  private setupClientDev = async (compiler) => {
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

  private setupDevServer = async (compiler) => {
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
    this.clientMemoryStats = await this.getMemoryStats(this.clientWdm);
    const assets = mapStats(this.clientMemoryStats, 'assetsByChunkName');

    tempArray = mapAssets(assets);

    const mainIndex = tempArray.findIndex((p) => /main/.test(p.filename));
    return [
      ...tempArray.slice(0, mainIndex),
      ...tempArray.slice(mainIndex + 1),
      tempArray[mainIndex],
    ];
  };

  private getServerAssets = async () => {
    const serverDir = path.join(process.cwd(), BUILD_DIR, SERVER_BUILD_DIR);

    const wdmAssets = await this.getMemoryStats(this.serverWdm);
    const stats = mapStats(wdmAssets, 'assetsByChunkName');
    const assets = mapAssets(stats);

    const serverRequiredAssets = assets.filter((a) => /(routes|document|wrap|app)/.test(a.name));

    return serverRequiredAssets.reduce((p, c) => {
      const assetPath = path.join(serverDir, c.filename);

      // cleaning cache to make sure server is requiring the latest entry
      delete require.cache[assetPath];
      delete __non_webpack_require__.cache[assetPath];

      return {
        ...p,
        [c.name]: requireRuntime(assetPath),
      };
    }, {}) as ServerAssets;
  };

  private getMemoryStats = async (webpackDevMiddleware: devMiddleware) => {
    const wdmPreStats = await this.waitUntilValid(webpackDevMiddleware);
    if (wdmPreStats) {
      return wdmPreStats.toJson();
    }

    return {};
  };

  private waitUntilValid = (
    webpackDevMiddleware: devMiddleware,
  ): Promise<{ toJson: () => any } | null> => {
    return new Promise((resolve) => {
      webpackDevMiddleware.waitUntilValid(resolve);
    });
  };
}

export { DevServer as Server };
export default DevServer;
