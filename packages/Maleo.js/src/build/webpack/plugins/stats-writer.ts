import path from 'path';
import { Compiler } from 'webpack';
import { AUTODLL_PATH } from '@src/constants';

const INDENT = 2;
const DEFAULT_TRANSFORM = async (data) => JSON.stringify(data, null, INDENT);

export interface Opts {
  filename: string;
  fields: string[];
  isDev: boolean;
  transform: (data: any, compiler?: any) => Promise<string>;
}

export class StatsWriterPlugin {
  opts: Opts;
  dllFilename: string;

  constructor(opts?) {
    this.opts = {
      filename: 'stats.json',
      fields: ['assetsByChunkName'],
      isDev: false,
      transform: DEFAULT_TRANSFORM,
      ...opts,
    };
  }

  apply = (compiler: Compiler) => {
    try {
      compiler.plugin('autodll-stats-retrieved', this.getAutoDLLPath);
    } catch (err) {
      // @ts-ignore
    } finally {
      compiler.hooks.emit.tapPromise('maleo-stats-writer-plugin', this.emitStats);
    }
  };

  emitStats = async (compilation, callback): Promise<any> => {
    let stats = compilation.getStats().toJson();

    // Filter to fields
    if (this.opts.fields) {
      stats = this.opts.fields.reduce(
        (memo, key) => ({
          ...memo,
          [key]: stats[key],
        }),
        {},
      );
    }

    if (this.opts.isDev) {
      stats = {
        ...stats,
        development: this.dllFilename
          ? {
              dll: [path.join(AUTODLL_PATH, this.dllFilename)],
            }
          : {},
      };
    }

    // Transform to string
    const [err, statsStr] = await to<string>(
      this.opts.transform(stats, {
        compiler: compilation,
      }),
    );

    if (err) {
      compilation.errors.push(err);
      if (callback) {
        return void callback(err);
      }

      throw err;
    }

    // Add to assets
    compilation.assets[this.opts.filename] = {
      source() {
        return statsStr;
      },
      size() {
        return statsStr!.length;
      },
    };

    if (callback) {
      return void callback();
    }
  };

  getAutoDLLPath = (stats) => {
    this.dllFilename = stats.assetsByChunkName.dll;
  };
}

export function to<T, U = Error>(
  promise: Promise<T>,
  errorExt?: object,
): Promise<[U | null, T | undefined]> {
  return promise
    .then<[null, T]>((data: T) => [null, data])
    .catch<[U, undefined]>((err: U) => {
      if (errorExt) {
        Object.assign(err, errorExt);
      }

      return [err, undefined];
    });
}
