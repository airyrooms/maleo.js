import { Compiler } from 'webpack';

import { to } from '@utils/index';
import { STATS_FILENAME } from '~/src/constants';

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
      filename: STATS_FILENAME,
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
    stats = mapStats(stats, key);

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
}

export const mapStats = (stats: any, key: string) => {
  // Extract dynamic assets
  const extractDynamic = (stat, isDynamic = false) => {
    return Object.keys(stat)
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
          [c]: stat[c],
        }),
        {},
      );
  };

  return {
    static: extractDynamic(stats[key], false),
    dynamic: extractDynamic(stats[key], true),
  };
};
