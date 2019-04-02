import webpack from 'webpack';
import { Context } from './IWebpackInterfaces';

export interface IBuildOptions extends Context {
  callback?: (err: Error, stats: webpack.Stats) => void;
}
