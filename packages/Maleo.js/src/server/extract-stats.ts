import { requireRuntime } from '@utils/require';
import { RawStats, PreloadAssets } from '@interfaces/server';

// get bundles from webpack assets.json
export const extractStats = (statsPath: string) => {
  const stats = requireRuntime(statsPath);
  return mapAssets(stats);
};

// Map stats to assets preload
export const mapAssets = (stats: RawStats): PreloadAssets[] => {
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
  ) as PreloadAssets[];
};
