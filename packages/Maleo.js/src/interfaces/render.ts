import React from 'react';
import { RouteProps, RouteComponentProps, match as Match } from 'react-router-dom';
import { Request, Response } from 'express';
import { History, Location } from 'history';
import Loadable from 'react-loadable';

import { PreloadAssets } from './server';
import Document from '@render/_document';
import { _App } from '@render/_app';
import Wrap from '@render/_wrap';

export interface WithGIP {
  getInitialProps: (ctx: any) => any;
}

export type DocumentType = React.ComponentType<Document> & WithGIP;
export type WrapType = React.ComponentType<Wrap> & WithGIP;
export type AppType = React.ComponentType<_App> & WithGIP;

// Render Component Interfaces
export interface AppProps {
  routes: AsyncRouteProps[];
  data?: InitialProps['data'];

  // withRouter
  location: Location;
  history: History;
  match: Match<any>;

  context?: any;
  server?: boolean;
}

export interface ContainerProps {
  server: boolean;
  children: React.ReactElement<any>;
  location: string;
  context: any;
}

export interface HeaderProps {
  title?: string;
  defaultTitle?: string;
  onChangeClientState?: (newState, addedTags, removedTags) => void;
  children?: React.ReactElement<{}>;
}

export interface DocumentCommons {
  data: InitialProps['data'];
  branch: Branch | null;
  preloadScripts: any;
  html: string;
  ctx: any;
}

export interface DocumentProps extends DocumentCommons {
  html: string;
  bundles: PreloadAssets[];
}

export interface DocumentContext extends DocumentCommons {
  req?: Request;
  res?: Response;
  renderPage?: (fn?) => Promise<any>;
}

export interface WrapProps {
  children: React.ReactElement<any>;
  Container: typeof React.Component;
  App: typeof React.Component;
  containerProps: ContainerProps;
  appProps: AppProps;
}

export interface AsyncRouteComponentState {
  Component: AsyncRouteableComponent | null;
}

export interface CtxBase {
  req?: Request;
  res?: Response;
  history: History;
  location: Location;
}

export interface Ctx<p> extends CtxBase {
  match: Match<p>;
}

export interface AsyncComponent {
  getInitialProps?: (props: Ctx<any>) => any;
}

export interface AsyncRouteComponent<Props = {}>
  extends AsyncComponent,
    React.Component<DocumentProps & Props, AsyncRouteComponentState> {}

export type AsyncRouteComponentType<Props> =
  | React.ComponentClass<Props> & AsyncComponent
  | React.StatelessComponent<Props> & AsyncComponent;

export type AsyncRouteableComponent<Props = any> =
  | AsyncRouteComponentType<RouteComponentProps<Props>>
  | React.ComponentType<RouteComponentProps<Props>>
  | React.ComponentType<Props>;

export interface AsyncRouteProps<Props = any> extends RouteProps {
  key?: string;
  routes?: Array<AsyncRouteProps<Props>>;
  redirectTo?: string;
  component: AsyncRouteableComponent<Props>;
}

export interface InitialProps {
  branch?: Branch;
  // data: Array<Promise<any>>;
  data: {
    [key: string]: Promise<any>;
  };
}

export interface CustomLoadableComponent<Props = any> extends Loadable.LoadableComponent {
  preload: () => { default: AsyncRouteableComponent<Props> };
}
export interface PreRouteProps<Props = any> {
  key?: string;
  routes?: Array<AsyncRouteProps<Props>>;
  redirectTo?: string;
  component: CustomLoadableComponent;
}

export interface PreBranch {
  route: PreRouteProps;
  match: Match;
}

export interface Branch {
  route: AsyncRouteProps;
  match: Match;
}

export interface RenderParam {
  req: Request;
  res: Response;
  dir: string;
  renderStatic?: boolean;

  renderPage?: (
    param: RenderPageParams,
  ) => (fn?: ModPageFn) => Promise<{ html: string; bundles: PreloadAssets[] }>;

  preloadScripts?: (
    dir: string,
    tempArray: any[],
    context: PreloadScriptContext,
  ) => PreloadAssets[] | Promise<PreloadAssets[]>;

  getServerAssets?: () => Promise<ServerAssets>;
}

export interface PreloadScriptContext {
  req: Request;
  res: Response;
}

export interface RenderPageParams {
  req: Request;
  App: AppType;
  Wrap: WrapType;
  routes: AsyncRouteProps[];
  data: any;
  renderer?: (element: React.ReactElement<any>) => { html: string } | any;
  props?: {
    wrap?: any;
    app?: any;
  };
}

export type ModPageFn = <Props>(
  Page: React.ComponentType<Props>,
) => (props: Props) => React.ReactElement<Props>;

export interface ServerAssets {
  routes: AsyncRouteProps[];
  document: DocumentType;
  app: AppType;
  wrap: WrapType;
}
