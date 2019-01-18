// This file is imported from Next.js 7

/**
COPYRIGHT (c) 2017-present James Kyle <me@thejameskyle.com>
 MIT License
 Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:
 The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.
 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWAR
*/
// Implementation of this PR: https://github.com/jamiebuilds/react-loadable/pull/132
// Modified to strip out unneeded results for Next's specific use case

import url from 'url';
import webpack from 'webpack';

function buildManifest(
  compiler: webpack.Compiler,
  compilation: webpack.compilation.Compilation,
): {} {
  const { context } = compiler.options;
  // tslint:disable-next-line:prefer-const
  let manifest = {};

  compilation.chunks.forEach((chunk) => {
    chunk.files.forEach((file) => {
      for (const module of chunk.modulesIterable) {
        const { id } = module;
        const name = typeof module.libIdent === 'function' ? module.libIdent({ context }) : null;
        // If it doesn't end in `.js`, we can't handle it right now.

        // if (!file.match(/\.js$/) || !file.match(/^static\/chunks\//)) {
        //   return;
        // }
        const publicPath = url.resolve(compilation.outputOptions.publicPath || '', file);

        let currentModule = module;

        if (module.constructor.name === 'ConcatenatedModule') {
          currentModule = module.rootModule;
        }
        if (!manifest[currentModule.rawRequest]) {
          manifest[currentModule.rawRequest] = [];
        }

        manifest[currentModule.rawRequest].push({ id, name, file, publicPath });
      }
    });
  });

  return manifest;
}

export interface ReactLoadablePluginOptions {
  filename?: string;
}

export class ReactLoadablePlugin implements webpack.Plugin {
  private filename: string;
  constructor(opts: ReactLoadablePluginOptions = {}) {
    this.filename = opts.filename || 'react-loadable-manifest.json';
  }

  apply(compiler: webpack.Compiler) {
    compiler.hooks.emit.tapAsync('ReactLoadableManifest', (compilation, callback) => {
      const manifest = buildManifest(compiler, compilation);
      const json = JSON.stringify(manifest, null, 2);
      compilation.assets[this.filename] = {
        source() {
          return json;
        },
        size() {
          return json.length;
        },
      };
      callback();
    });
  }
}
