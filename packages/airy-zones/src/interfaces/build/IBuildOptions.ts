import webpack from 'webpack';

export interface IBuildOptions {
  env: 'development' | 'production' | 'none';
  buildType: 'server' | 'client' | 'all';
  callback?: (err: Error, stats: webpack.Stats) => void;
}
