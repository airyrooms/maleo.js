import webpack from 'webpack';

export interface IBuildOptions {
  env: 'development' | 'production' | 'none';
  buildType: 'server' | 'client' | 'all';
  minimalBuild?: boolean;
  callback?: (err: Error, stats: webpack.Stats) => void;
}
