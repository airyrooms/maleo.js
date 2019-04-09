// Inspired by https://github.com/tfoxy/webpack-lazy-dev-build
/**
    The MIT License (MIT)

    Copyright (c) 2018 Tomás Fox

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
 */

// tslint:disable: no-console

import { getFilenameFromUrl, handleRequest } from 'webpack-dev-middleware/lib/util';

/** Copied from webpack/lib/util/objectToMap.js (v4.6.0) */
function objectToMap(obj = {}) {
  const mapifiy: string[][] = Object.keys(obj).map((key) => {
    /** @type {[string, string]} */
    const pair = [key, obj[key]];
    return pair;
  });

  // @ts-ignore
  return new Map(mapifiy);
}

export class LazyBuild {
  requestedFiles = new Set();
  neededModules = new Set();

  createPlugin = () => {
    return new WebpackLazyBuildPlugin(this);
  };

  createMiddleware = (devMiddleware) => {
    return async (req, res, next) => {
      if (req.method !== 'GET') {
        return next();
      }

      const { context } = devMiddleware;
      const reqFilename = getFilenameFromUrl(context.options.publicPath, context.compiler, req.url);
      if (reqFilename === false) {
        return next();
      }

      const processFile = (filename) => {
        if (context.webpackStats && !this.requestedFiles.has(filename)) {
          this.requestedFiles.add(filename);
          const stats = context.webpackStats.stats || [context.webpackStats];
          const modifiedStats = stats.find(({ compilation }) => {
            let { outputPath } = compilation.compiler;
            if (!outputPath.endsWith('/')) {
              outputPath += '/';
            }
            if (!filename.startsWith(outputPath)) {
              return;
            }
            const chunkFilename = filename.slice(outputPath.length);
            const filteredChunks = compilation.chunks.filter((chunk) => {
              return chunk.files.includes(chunkFilename);
            });
            if (!filteredChunks.length) {
              return;
            }
            filteredChunks.forEach((chunk) => {
              for (const module of chunk.modulesIterable) {
                this.neededModules.add(module.resource || module.debugId);
              }
            });
            return true;
          });
          if (modifiedStats) {
            this.recompile(context, modifiedStats.compilation.compiler);
          }
        }
      };

      const assetUrl = this.getAssetUrl(req.url);
      // CSS files handler
      if (assetUrl && assetUrl !== req.url) {
        const assetFilename = getFilenameFromUrl(
          context.options.publicPath,
          context.compiler,
          assetUrl,
        );
        if (assetFilename !== false) {
          const assetReq = { ...req };
          assetReq.url = assetUrl;
          processFile(assetFilename);
          return handleRequest(
            context,
            assetFilename,
            () => {
              this.requestedFiles.add(reqFilename);
              return devMiddleware(req, res, next);
            },
            assetReq,
          );
        }
      }

      processFile(reqFilename);
      return devMiddleware(req, res, next);
    };
  };

  private recompile = (context, compiler) => {
    context.state = false;
    const watchings = context.watching.watchings || [context.watching];
    const watching = watchings.find((w) => w.compiler === compiler);
    watching.pausedWatcher = watching.watcher;
    watching.watcher = null;

    let timestamps = compiler.watchFileSystem.watcher.getTimes();
    if (compiler.hooks) {
      timestamps = objectToMap(timestamps);
    }
    compiler.fileTimestamps = timestamps;
    compiler.contextTimestamps = timestamps;

    watching.invalidate();
  };

  getAssetUrl(url) {
    if (url.endsWith('.css')) {
      url = url.slice(0, -4) + '.js';
    }
    return url;
  }
}

class WebpackLazyBuildPlugin {
  lazyBuild: LazyBuild;

  constructor(lazyBuild: LazyBuild) {
    this.lazyBuild = lazyBuild;
  }

  apply(compiler) {
    const hasHooks = Boolean(compiler.hooks);
    const compilationCallback = (compilation) => {
      console.log('[Lazy-Development-Build-Plugin] - Running');

      const buildModuleCallback = (module) => {
        if (this.lazyBuild.neededModules.has(module.resource || module.debugId)) {
          return;
        }

        const isLazy = module.reasons.every((reason) => {
          const { type } = reason.dependency;
          return type === 'import()' || type === 'single entry';
        });

        if (isLazy) {
          if (hasHooks) {
            const buildCopy = module.build;
            module.build = () => {
              console.log('[Lazy-Development-Build-Plugin] - Building', module.resource);
              module.buildMeta = {};
              module.buildInfo = {
                builtTime: Date.now(),
                contextDependencies: module._contextDependencies,
              };
            };
            setTimeout(() => {
              const callbackList = compilation._buildingModules.get(module);
              compilation._buildingModules.delete(module);
              for (const cb of callbackList) {
                cb();
              }
              module.build = buildCopy;
            });
          } else {
            module.building = [];
            setTimeout(() => {
              const { building } = module;
              module.building = undefined;
              building.forEach((cb) => cb());
            });
          }
        } else {
          this.lazyBuild.neededModules.add(module.resource || module.debugId);
        }
      };

      if (hasHooks) {
        compilation.hooks.buildModule.tap('WebpackLazyDevBuildPlugin', buildModuleCallback);
      } else {
        compilation.plugin('build-module', buildModuleCallback);
      }
    };

    if (hasHooks) {
      compiler.hooks.compilation.tap('WebpackLazyDevBuildPlugin', compilationCallback);
    } else {
      compiler.plugin('compilation', compilationCallback);
    }
  }
}
