/**
  The MIT License (MIT)
  Copyright (c) 2016-present ZEIT, Inc.
  Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
  The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
  
  https://github.com/zeit/next.js/blob/canary/packages/next/build/webpack/plugins/nextjs-require-cache-hot-reloader.js
 */

function deleteCache(path: string) {
  delete require.cache[path];
}

// This plugin flushes require.cache after emitting the files. Providing 'hot reloading' of server files.
export class RequireCacheHMR {
  prevAssets: null | {
    [key: string]: { existsAt: string };
  };
  constructor() {
    this.prevAssets = null;
  }
  apply(compiler: any) {
    compiler.hooks.afterEmit.tapAsync('RequireCacheHMRReloader', (compilation, callback) => {
      const { assets } = compilation;

      if (this.prevAssets) {
        for (const f of Object.keys(assets)) {
          deleteCache(assets[f].existsAt);
        }
        for (const f of Object.keys(this.prevAssets)) {
          if (!assets[f]) {
            deleteCache(this.prevAssets[f].existsAt);
          }
        }
      }
      this.prevAssets = assets;

      callback();
    });
  }
}

export default RequireCacheHMR;
