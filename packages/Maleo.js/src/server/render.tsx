import React from 'react';
import path from 'path';
import { renderToString } from 'react-dom/server';
import Loadable from 'react-loadable';
import { getBundles } from 'react-loadable/webpack';
import { Response } from 'express';

import { REACT_LOADABLE_MANIFEST } from '@src/constants';
import { isPromise } from '@utils/index';
import { requireDynamic, requireRuntime } from '@utils/require';
import { loadInitialProps, loadComponentProps } from './loadInitialProps';
import { matchingRoutes } from './routeHandler';
import {
  RenderParam,
  RenderPageParams,
  LoadableBundles,
  DocumentContext,
} from '@interfaces/render/IRender';

import { Document as DefaultDocument } from '@render/_document';
import { App as DefaultApp } from '@render/_app';
import { _Wrap as DefaultWrap } from '@render/_wrap';

export const mapAssets = (stats: any) => {
  const { assetsByChunkName } = stats;
  let assets = assetsByChunkName;

  if (process.env.NODE_ENV !== 'production') {
    assets = {
      ...assets,
      ...stats.development,
    };
  }

  return Object.keys(assets).reduce(
    (accumulator, current) => [
      ...accumulator,
      {
        name: current,
        filename: assets[current].constructor === Array ? assets[current][0] : assets[current],
      },
    ],
    [],
  );
};

export const getPreloadScripts = async (dir: string, res: Response) => {
  if (__DEV__) {
    const stats = res.locals.webpackStats.toJson().children[0];
    return mapAssets(stats);
  }

  // get bundles from webpack assets.json
  return mapAssets(requireRuntime(path.join(dir, 'stats.json')));
};

const modPageFn = function<Props>(Page: React.ComponentType<Props>) {
  return (props: Props) => <Page {...props} />;
};
export const defaultRenderPage = ({ req, Wrap, App, routes, data, props }: RenderPageParams) => {
  return async (
    fn = modPageFn,
  ): Promise<{
    html: string;
    bundles: LoadableBundles[];
  }> => {
    const renderer = (element: React.ReactElement<any>): { html: string } => ({
      html: renderToString(element),
    });

    const appContext = {};

    // get required bundles from react-loadable.json
    const modules: string[] = [];
    const reportResults = (moduleName) => modules.push(moduleName);

    // execute getInitialProps in Wrap and App component
    const wrapProps = props && props.wrap ? props.wrap : {};
    const appProps = props && props.app ? props.app : {};

    const asyncOrSyncRender = renderer(
      <Loadable.Capture report={reportResults}>
        <Wrap location={req.baseUrl} context={appContext} server {...wrapProps}>
          {fn(App)({ routes, data, ...appProps })}
        </Wrap>
      </Loadable.Capture>,
    );

    const { html, ...rest } = isPromise(asyncOrSyncRender)
      ? await asyncOrSyncRender
      : asyncOrSyncRender;

    let reactLoadableJson = {};

    try {
      reactLoadableJson = await requireDynamic(
        path.resolve('.maleo', 'client', REACT_LOADABLE_MANIFEST),
      );
    } catch (error) {}

    const bundles: LoadableBundles[] = getBundles(reactLoadableJson, modules)
      // removes falsy value
      .filter(Boolean)
      // removes .map files
      .filter((b) => b.file.endsWith('.js'))
      // maps to readable bundle array
      .map((bundle) => ({
        name: bundle.name,
        filename: bundle.file,
      }));

    return { html, bundles, ...rest };
  };
};

export const render = async ({
  req,
  res,
  dir,
  routes,
  Document = DefaultDocument,
  App = DefaultApp,
  Wrap = DefaultWrap,
  renderPage = defaultRenderPage,
}: RenderParam) => {
  const preloadScripts = await getPreloadScripts(dir, res);

  // matching routes
  const matchedRoutes = matchingRoutes(routes, req.baseUrl);

  if (!matchedRoutes) {
    res.status(404);
    return;
  }

  // get Wrap props & App props
  const ctx = { req, res };
  const wrapProps = await loadComponentProps(Wrap, ctx);
  const appProps = await loadComponentProps(App, ctx);

  // execute getInitialProps on every matched component
  const { data, branch } = await loadInitialProps(matchedRoutes, {
    req,
    res,
    ...wrapProps,
    ...appProps,
  });

  // setup Document component & renderToString to client
  if (branch) {
    const { route, match } = branch;

    if (match.path === '**') {
      res.status(404);
    } else if (branch && route.redirectTo && match.path) {
      res.redirect(301, req.originalUrl.replace(match.path, route.redirectTo));
      return;
    }

    const { bundles, html } = await renderPage({
      req,
      Wrap,
      App,
      routes,
      data,
      props: { wrap: wrapProps, app: appProps },
    })();

    // Loads Loadable bundle first
    const scripts = [...bundles, ...preloadScripts];

    const docContext: DocumentContext = {
      req,
      res,
      data,
      branch,
      preloadScripts: scripts,
      html,
      ...wrapProps,
      ...appProps,
    };

    const initialProps = await Document.getInitialProps(docContext);

    return renderToString(<Document {...initialProps} />);
  }
  return 'error';
};
