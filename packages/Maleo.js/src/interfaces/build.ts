import webpack from 'webpack';
import { Configuration } from 'webpack';
import { IHelmetContentSecurityPolicyConfiguration } from 'helmet';

export interface Context {
  isServer?: boolean;
  env: 'development' | 'production' | 'none' | string;
  projectDir: string;
  minimalBuild?: boolean;
  experimentalLazyBuild?: boolean;
  esModules?: boolean;
}

export interface IBuildOptions extends Context {
  callback?: (err: Error, stats: webpack.Stats) => void;
  buildType?: string;
}

export interface CustomConfig {
  buildDir?: string;
  cache?: boolean;
  sourceMaps?: boolean;

  // server build whitelist
  whitelist?: Array<string | RegExp>;

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
  favicon?: string;

  isDev?: boolean;

  // static export
  staticPages?: StaticPages;

  csp?: boolean | IHelmetContentSecurityPolicyConfiguration;

  esModules?: boolean;
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
  favicon: string;
  csp: CustomConfig['csp'];
}
