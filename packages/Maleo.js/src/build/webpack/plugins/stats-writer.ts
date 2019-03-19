import { Compiler } from 'webpack';

const INDENT = 2;
const DEFAULT_TRANSFORM = async (data) => JSON.stringify(data, null, INDENT);

export interface Opts {
  filename: string;
  isDev: boolean;
  transform: (data: any, compiler?: any) => Promise<string>;
}

export class StatsWriterPlugin {
  opts: Opts;
  dllFilename: string;

  constructor(opts?) {
    this.opts = {
      filename: 'stats.json',
      isDev: false,
      transform: DEFAULT_TRANSFORM,
      ...opts,
    };
  }

  apply = (compiler: Compiler) => {
    compiler.hooks.emit.tapPromise('maleo-stats-writer-plugin', this.emitStats);
  };

  emitStats = async (compilation, callback): Promise<any> => {
    let stats = compilation.getStats().toJson();

    // Filter to fields
    // Extract dynamic assets to dynamic key

    const key = 'assetsByChunkName';
    stats = {
      static: this.extractDynamic(stats[key], false),
      dynamic: this.extractDynamic(stats[key], true),
    };

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

  // Extract dynamic assets
  extractDynamic = (stats, isDynamic = false) => {
    return Object.keys(stats)
      .filter((k) => {
        const regex = /dynamic\./;
        if (isDynamic) {
          return !!regex.test(k);
        }
        return !regex.test(k);
      })
      .reduce(
        (p, c) => ({
          ...p,
          [c]: stats[c],
        }),
        {},
      );
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
