import webpack from 'webpack';
import { Configuration, RuleSetRule } from 'webpack';

export interface Context {
  isServer?: boolean;
  env: 'development' | 'production' | 'none';
  projectDir: string;
  minimalBuild?: boolean;
  experimentalLazyBuild?: boolean;
}

export interface IBuildOptions extends Context {
  callback?: (err: Error, stats: webpack.Stats) => void;
}

export interface CustomConfig {
  buildDir?: string;
  cache?: boolean;
  sourceMaps?: boolean;

  alias?: { [key: string]: string };
  publicPath?: string;
  analyzeBundle?: boolean;
  webpack?: (
    config: Configuration,
    context: Context,
    next: WebpackCustomConfigCallback,
  ) => Configuration;

  customWrap?: string;
  customApp?: string;
  customDocument?: string;
  routes?: string;

  distDir?: string;
  assetDir?: string;

  isDev?: boolean;

  // static export
  staticPages?: StaticPages;
}

export interface StaticPages {
  [key: string]: StaticPage;
}

export interface StaticPage {
  page: string; // path to targeted page
}

export type WebpackCustomConfigCallback = (customConfig: CustomConfig) => Configuration;

export interface BuildContext extends Context {
  isDev: boolean;
  publicPath: string;
  analyzeBundle?: boolean;
  buildDirectory: string;
  name: string;
}
