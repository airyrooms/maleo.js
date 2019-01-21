import { DocumentProps, AppProps } from '../render/IRender';

export interface IOptions {
  port: number;

  assetDir: string;
  distDir: string;
  routes: [];

  _document?: React.ReactElement<DocumentProps>;
  _app?: React.ReactElement<AppProps>;
  _wrap?: React.ReactElement<any>;
}
