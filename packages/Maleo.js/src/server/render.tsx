import React from 'react';
import path from 'path';
import { renderToString } from 'react-dom/server';
import Loadable from 'react-loadable';
import { getBundles } from 'react-loadable/webpack';

import {
  REACT_LOADABLE_MANIFEST,
  BUILD_DIR,
  CLIENT_BUILD_DIR,
  SERVER_BUILD_DIR,
} from '@constants/index';
import { isPromise } from '@utils/index';
import { requireDynamic, requireRuntime } from '@utils/require';
import { loadInitialProps, loadComponentProps } from './loadInitialProps';
import { matchingRoutes } from '@routes/matching-routes';
import {
  RenderParam,
  RenderPageParams,
  LoadableBundles,
  DocumentContext,
  ServerAssets,
  PreloadScriptContext,
} from '@interfaces/render/IRender';
import extractStats from './extract-stats';

import { ContainerComponent } from '@render/_container';

// * HTML doctype * //
const DOCTYPE = '<!DOCTYPE html>';

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
    const reportResults = (moduleName) => {
      modules.push(moduleName);
    };

    // execute getInitialProps in Wrap and App component
    const wrapProps = props && props.wrap ? props.wrap : {};
    const appProps = props && props.app ? props.app : {};

    await Loadable.preloadAll(); // Make sure all dynamic imports are loaded

    // in SSR, we need to manually define location object
    // to be passed in App because withRouter doesn't work on server side
    const location = req.originalUrl;

    const asyncOrSyncRender = renderer(
      <Loadable.Capture report={reportResults}>
        <Wrap
          Container={ContainerComponent}
          App={App}
          containerProps={{ location, context: appContext, server: true }}
          appProps={{ ...{ routes, data, location: { pathname: location }, ...appProps } }}
          {...wrapProps}
        />
      </Loadable.Capture>,
    );

    const { html, ...rest } = isPromise(asyncOrSyncRender)
      ? await asyncOrSyncRender
      : asyncOrSyncRender;

    let reactLoadableJson = {};

    try {
      reactLoadableJson = await requireDynamic(
        path.resolve(BUILD_DIR, CLIENT_BUILD_DIR, REACT_LOADABLE_MANIFEST),
      );
    } catch (error) {}

    const bundles: LoadableBundles[] = getBundles(reactLoadableJson, modules)
      .filter(Boolean) // removes falsy value
      .filter((b) => b.file.endsWith('.js')) // removes .map files
      .map((bundle) => ({
        // maps to readable bundle array
        name: bundle.name,
        filename: bundle.file,
      }));

    return { html, bundles, ...rest };
  };
};

let preloadedAssets: any[] = [];
export const render = async ({
  req,
  res,
  dir,
  renderPage = defaultRenderPage,
  preloadScripts = defaultPreloadScripts,
}: RenderParam) => {
  const { document: Document, routes, wrap: Wrap, app: App } = getServerAssets();

  // matching routes
  const matchedRoutes = await matchingRoutes(routes, req.originalUrl);

  if (!matchedRoutes.length) {
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
    preloadedAssets = await preloadScripts(dir, preloadedAssets, {
      req,
      res,
    });
    const scripts = [...bundles, ...preloadedAssets];

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

    const getRenderedString = renderToString(<Document {...initialProps} />);

    return `${DOCTYPE}${getRenderedString}`;
  }

  // TODO: add customizable error page
  return defaultRenderErrorPage();
};

export const renderStatic = async ({ req, res, renderPage = defaultRenderPage }: RenderParam) => {
  const { document: Document, routes, wrap: Wrap, app: App } = getServerAssets();

  // matching routes
  const matchedRoutes = await matchingRoutes(routes, req.originalUrl);

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
    const { html } = await renderPage({
      req,
      Wrap,
      App,
      routes,
      data,
      props: { wrap: wrapProps, app: appProps },
    })();

    // Loads Loadable bundle first

    const docContext: DocumentContext = {
      req,
      res,
      data,
      branch,
      preloadScripts: [],
      html,
      ...wrapProps,
      ...appProps,
    };

    const initialProps = await Document.getInitialProps(docContext);

    return renderToString(<Document {...initialProps} />);
  }

  // TODO: add customizable error page
  return defaultRenderErrorPage();
};

const defaultRenderErrorPage = () => {
  return (
    <html>
      <head>
        <title>Error</title>
      </head>
      <body>Error</body>
    </html>
  );
};

const getServerAssets = (): ServerAssets => {
  const serverDir = path.join(process.cwd(), BUILD_DIR, SERVER_BUILD_DIR);
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

const defaultPreloadScripts: RenderParam['preloadScripts'] = (
  dir: string,
  tempArray: any[],
  context: PreloadScriptContext,
) => {
  // sort preload with main last
  if (!tempArray.length) {
    tempArray = extractStats(dir);
    const mainIndex = tempArray.findIndex((p) => /main/.test(p.filename));
    return [
      ...tempArray.slice(0, mainIndex),
      ...tempArray.slice(mainIndex + 1),
      tempArray[mainIndex],
    ];
  }

  return tempArray;
};
