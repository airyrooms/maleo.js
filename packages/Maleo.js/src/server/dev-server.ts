import { Request, Response } from 'express';
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
// import { LazyBuild } from './lazy-development-build';

const ignored = [/\.git/, /\.maleo\//, /node_modules/];

class DevServer extends Server {
  static init = (options: IOptions) => {
    return new DevServer(options);
  };

  memoryStats = null;
  wdm;

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

  private setupDevelopment = async () => {
    const webpack = requireRuntime('webpack');
    const { getConfigs } = requireRuntime(path.resolve(__dirname, '../build/index'));

    // const lazyBuild = new LazyBuild();

    const [clientConfig, serverConfig] = getConfigs({ env: 'development' });
    // clientConfig.plugins.push(lazyBuild.createPlugin());

    const multiCompiler = webpack([clientConfig, serverConfig]);
    const [clientCompiler, serverCompiler] = multiCompiler.compilers;

    this.setupClientDev(clientCompiler);
    this.setupDevServer(serverCompiler);
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

    this.wdm = devMiddleware(compiler, wdmOptions);
    // this.applyExpressMiddleware(lazyBuild.createMiddleware(this.wdm));
    this.applyExpressMiddleware(this.wdm);

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

    const serverWDM = devMiddleware(compiler, wdmOptions);
    this.applyExpressMiddleware(serverWDM);
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
    const wdmPreStats = await this.waitUntilValid(this.wdm);
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
