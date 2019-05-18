/**
  Copyright (c) 2016 Liad Yosef

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

import fs from 'fs';
import path from 'path';

function contains(arr, val) {
  return arr && arr.indexOf(val) !== -1;
}

const atPrefix = new RegExp('^@', 'g');
function readDir(dirName) {
  if (!fs.existsSync(dirName)) {
    return [];
  }

  try {
    return fs
      .readdirSync(dirName)
      .map(function(module) {
        if (atPrefix.test(module)) {
          // reset regexp
          atPrefix.lastIndex = 0;
          try {
            return fs.readdirSync(path.join(dirName, module)).map(function(scopedMod) {
              return module + '/' + scopedMod;
            });
          } catch (e) {
            return [module];
          }
        }
        return module;
      })
      .reduce(function(prev: string[], next) {
        return prev.concat(next);
      }, []);
  } catch (e) {
    return [];
  }
}

let packageJsonCache = {};

function readFromPackageJson(options) {
  if (typeof options !== 'object') {
    options = {};
  }
  // read the file
  let packageJson;
  try {
    const fileName = options.fileName || 'package.json';
    if (!packageJsonCache[fileName]) {
      const packageJsonString = fs.readFileSync(fileName, 'utf8');
      packageJsonCache = {
        ...packageJsonCache,
        [fileName]: JSON.parse(packageJsonString),
      };
    }

    packageJson = packageJsonCache[fileName];
  } catch (e) {
    return [];
  }
  // sections to search in package.json
  let sections = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'];
  if (options.include) {
    sections = [].concat(options.include);
  }
  if (options.exclude) {
    sections = sections.filter(function(section) {
      return ([] as string[]).concat(options.exclude).indexOf(section) === -1;
    });
  }
  // collect dependencies
  const deps = {};
  sections.forEach(function(section) {
    Object.keys(packageJson[section] || {}).forEach(function(dep) {
      deps[dep] = true;
    });
  });

  return Object.keys(deps);
}

function containsPattern(arr, val) {
  return (
    arr &&
    arr.some(function(pattern) {
      if (pattern instanceof RegExp) {
        return pattern.test(val);
      } else if (typeof pattern === 'function') {
        return pattern(val);
      } else {
        return pattern === val;
      }
    })
  );
}

const scopedModuleRegex = new RegExp(
  '@[a-zA-Z0-9][\\w-.]+/[a-zA-Z0-9][\\w-.]+([a-zA-Z0-9./]+)?',
  'g',
);

function getModuleName(request, includeAbsolutePaths) {
  let req = request;
  const delimiter = '/';

  if (includeAbsolutePaths) {
    req = req.replace(/^.*?\/node_modules\//, '');
  }
  // check if scoped module
  if (scopedModuleRegex.test(req)) {
    // reset regexp
    scopedModuleRegex.lastIndex = 0;
    return req.split(delimiter, 2).join(delimiter);
  }
  return req.split(delimiter)[0];
}

export default function nodeExternals(options) {
  options = options || {};
  const whitelist = [].concat(options.whitelist || []);
  const binaryDirs = [].concat(options.binaryDirs || ['.bin']);
  const importType = options.importType || 'commonjs';
  const modulesDir = options.modulesDir || 'node_modules';
  const modulesFromFile = !!options.modulesFromFile;
  const includeAbsolutePaths = !!options.includeAbsolutePaths;

  // helper function
  function isNotBinary(x) {
    return !contains(binaryDirs, x);
  }

  // create the node modules list
  const nodeModules = modulesFromFile
    ? readFromPackageJson(options.modulesFromFile)
    : (readDir(modulesDir) as string[]).filter(isNotBinary);

  // return an externals function
  return function(context, request, callback) {
    const moduleName = getModuleName(request, includeAbsolutePaths);
    if (contains(nodeModules, moduleName) && !containsPattern(whitelist, request)) {
      if (typeof importType === 'function') {
        return callback(null, importType(request));
      }
      // mark this module as external
      // https://webpack.js.org/configuration/externals/
      return callback(null, importType + ' ' + request);
    }
    callback();
  };
}
