import { Configuration, RuleSetRule } from 'webpack';

export interface Context {
  isServer?: boolean;
  env: 'development' | 'production' | 'none';
  projectDir: string;
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
}

export type WebpackCustomConfigCallback = (customConfig: CustomConfig) => Configuration;

export interface BuildContext extends Context {
  isDev: boolean;
  publicPath: string;
  analyzeBundle?: boolean;
  buildDirectory: string;
  name: string;
}
