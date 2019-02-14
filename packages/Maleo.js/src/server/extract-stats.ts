import path from 'path';

import { requireRuntime } from '@utils/require';

export const extractStats = (dir: string) => {
  // get bundles from webpack assets.json
  return mapAssets(requireRuntime(path.join(dir, 'stats.json')));
};

export default extractStats;

export const mapAssets = (stats: any) => {
  const { assetsByChunkName } = stats;
  let assets = assetsByChunkName;

  if (process.env.NODE_ENV !== 'production') {
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
