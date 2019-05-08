import path from 'path';

import { requireRuntime } from '@utils/require';

export const extractStats = (dir: string) => {
  // get bundles from webpack assets.json
  return mapAssets(requireRuntime(path.join(dir, 'stats.json')));
};

export default extractStats;

export const mapAssets = (stats: any) => {
  let assets = stats.static;

  if (process.env.NODE_ENV === 'development') {
    assets = {
      ...assets,
      ...stats.development,
    };
  }

  return Object.keys(assets).reduce(
    (accumulator, current) => [
      ...accumulator,
      {
        name: current,
        filename: assets[current].constructor === Array ? assets[current][0] : assets[current],
      },
    ],
    [],
  );
};
