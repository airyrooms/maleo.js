import React from 'react';
import { RouteProps, RouteComponentProps, match as Match } from 'react-router-dom';
import { Request, Response } from 'express';
import { History, Location } from 'history';
import Loadable from 'react-loadable';

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

export interface LoadableBundles {
  name: string;
  filename: string;
}

export interface DocumentProps extends DocumentCommons {
  html: string;
  bundles: LoadableBundles[];
}
export interface DocumentContext extends DocumentCommons {
  req?: Request;
  res?: Response;
  renderPage?: (fn?) => Promise<any>;
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

  renderPage?: (
    param: RenderPageParams,
  ) => (fn?: ModPageFn) => Promise<{ html: string; bundles: LoadableBundles[] }>;

  preloadScripts: (
    dir: string,
    tempArray: any[],
    context: PreloadScriptContext,
  ) => any[] | Promise<any[]>;

  getServerAssets: () => Promise<ServerAssets>;
}

export interface PreloadScriptContext {
  req: Request;
  res: Response;
}

export interface RenderPageParams {
  req: Request;
  App: typeof React.Component;
  Wrap: typeof React.Component;
  routes: AsyncRouteProps[];
  data: any;
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
  document: typeof React.Component;
  app: typeof React.Component;
  wrap: typeof React.Component;
}
