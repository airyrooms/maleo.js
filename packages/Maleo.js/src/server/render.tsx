import React from 'react';
import path from 'path';
import { renderToString } from 'react-dom/server';
import Loadable from 'react-loadable';
import { getBundles } from 'react-loadable/webpack';

import { REACT_LOADABLE_MANIFEST, BUILD_DIR } from '@constants/index';
import { isPromise } from '@utils/index';
import { requireDynamic, requireRuntime } from '@utils/require';
import { loadInitialProps, loadComponentProps } from './loadInitialProps';
import { matchingRoutes } from './routeHandler';
import {
  RenderParam,
  RenderPageParams,
  LoadableBundles,
  DocumentContext,
  ServerAssets,
} from '@interfaces/render/IRender';
import extractStats from './extract-stats';

export const defaultRenderPage = ({ req, Wrap, App, routes, data, props }: RenderPageParams) => {
  return async (): Promise<{
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
        <Wrap location={req.originalUrl} context={appContext} server {...wrapProps}>
          <App {...{ routes, data, location: { pathname: req.originalUrl }, ...appProps }} />
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

let preloadScripts: any[] = [];
export const render = async ({ req, res, dir, renderPage = defaultRenderPage }: RenderParam) => {
  const { document: Document, routes, wrap: Wrap, app: App } = getServerAssets();

  // sort preload with main last
  if (__DEV__ || (!__DEV__ && !preloadScripts.length)) {
    preloadScripts = extractStats(dir);
    const mainIndex = preloadScripts.findIndex((p) => /main/.test(p.filename));
    preloadScripts = [
      ...preloadScripts.slice(0, mainIndex),
      ...preloadScripts.slice(mainIndex + 1),
      preloadScripts[mainIndex],
    ];
  }

  // matching routes
  const matchedRoutes = await matchingRoutes(routes, req.baseUrl);

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

  // TODO: add customizable error page
  return 'error';
};

const getServerAssets = (): ServerAssets => {
  const serverDir = path.join(process.cwd(), BUILD_DIR);
  const assets = extractStats(serverDir);

  const serverRequiredAssets = assets.filter((a) => /(routes|document|wrap|app)/.test(a.name));

  return serverRequiredAssets.reduce(
    (p, c) => ({
      ...p,
      [c.name]: requireRuntime(path.join(serverDir, c.filename)),
    }),
    {},
  ) as ServerAssets;
};
