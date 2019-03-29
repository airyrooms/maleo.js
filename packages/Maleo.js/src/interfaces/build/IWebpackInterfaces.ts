import { Configuration, RuleSetRule } from 'webpack';

export interface Context {
  isServer?: boolean;
  env: 'development' | 'production' | 'none';
  projectDir: string;
  minimalBuild?: boolean;
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
