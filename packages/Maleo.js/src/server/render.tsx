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
  STATS_FILENAME,
  MATCHED_ROUTES_KEY,
} from '@constants/index';
import { isPromise } from '@utils/index';
import { requireRuntime } from '@utils/require';
import { getMatchedRoutes } from '@utils/getMatchedRoutes';
import { loadInitialProps, loadComponentProps } from '@routes/loadInitialProps';
import { matchingRoutes } from '@routes/matching-routes';
import {
  RenderParam,
  RenderPageParams,
  DocumentContext,
  ServerAssets,
  PreloadScriptContext,
} from '@interfaces/render';
import { extractStats } from './extract-stats';

import { ContainerComponent } from '@render/_container';
import { PreloadAssets } from '../interfaces/server';
import getHeadProvider from '@head/head-provider';
import { defaultHead } from '../head/head';

// * HTML doctype * //
const DOCTYPE = '<!DOCTYPE html>';

// In-memory array of assets object
let preloadedAssets: PreloadAssets[] = [];
export const render = async ({
  req,
  res,
  dir,
  renderPage = defaultRenderPage,
  preloadScripts = defaultPreloadScripts,
  getServerAssets = defaultGetServerAssets,
  renderStatic = false,
}: RenderParam) => {
  const { document: Document, routes, wrap: Wrap, app: App } = await getServerAssets();

  // req.path removes query string
  // we need this in order for react router match to work properly
  // query string may causes react router to not find any matched routes
  // more: https://github.com/wellyshen/react-cool-starter/issues/118
  const url = req.path;
  // matching routes
  const matchedRoutes = await matchingRoutes(routes, url);

  if (!matchedRoutes.length) {
    res.status(404);
    return;
  }

  // get Wrap props & App props
  const matched = await getMatchedRoutes(routes, url, matchedRoutes);
  const ctx = { req, res, routes, [MATCHED_ROUTES_KEY]: matched };
  const wrapProps = await loadComponentProps(Wrap, ctx);
  const { _global_ = {} } = wrapProps || {};
  const ctxGlobal = { ...ctx, _global_ };
  const appProps = await loadComponentProps(App, ctxGlobal);

  // execute getInitialProps on every matched component
  const { data, branch } = await loadInitialProps(matchedRoutes, {
    ...ctxGlobal,
    ...wrapProps,
    ...appProps,
  });

  // setup Document component & renderToString to client
  if (branch) {
    const { route, match } = branch;

    if (match.path === '**') {
      res.status(404);
    } else if (branch && route.redirectTo && match.path) {
      res.redirect(301, url.replace(match.path, route.redirectTo));
      return;
    }

    const { bundles, html, head } = await renderPage({
      req,
      Wrap,
      App,
      routes,
      data,
      props: { wrap: wrapProps, app: appProps },
    })();

    // Loads Loadable bundle first
    let scripts: PreloadAssets[] = [];
    if (!renderStatic) {
      preloadedAssets = await preloadScripts!(dir, preloadedAssets, {
        req,
        res,
      });
      scripts = [...bundles, ...preloadedAssets];
    }

    const docContext: DocumentContext = {
      req,
      res,
      initialProps: { ...data, wrap: wrapProps, app: appProps },
      branch,
      preloadScripts: scripts,
      html,
      head,
    };

    const initialProps = await Document.getInitialProps(docContext);

    const renderedDocument = renderToString(<Document {...initialProps} />);

    return `${DOCTYPE}${renderedDocument}`;
  }

  // TODO: add customizable error page
  return res.send(404);
};

export const defaultGetServerAssets = async (): Promise<ServerAssets> => {
  const serverDir = path.join(process.cwd(), BUILD_DIR, SERVER_BUILD_DIR);
  const serverStatsPath = path.join(serverDir, STATS_FILENAME);
  const assets = extractStats(serverStatsPath);

  const serverRequiredAssets = assets.filter((a) => /(routes|document|wrap|app)/.test(a.name));

  return serverRequiredAssets.reduce(
    (p, c) => ({
      ...p,
      [c.name]: requireRuntime(path.join(serverDir, c.filename)),
    }),
    {},
  ) as ServerAssets;
};

export const defaultPreloadScripts: RenderParam['preloadScripts'] = (
  dir: string,
  tempArray: PreloadAssets[],
  context: PreloadScriptContext,
) => {
  // sort preload with main last
  if (!tempArray.length) {
    const assetPath = path.join(dir, STATS_FILENAME);
    tempArray = extractStats(assetPath);
    const mainIndex = tempArray.findIndex((p) => /main/.test(p.filename));
    return [
      ...tempArray.slice(0, mainIndex),
      ...tempArray.slice(mainIndex + 1),
      tempArray[mainIndex],
    ];
  }

  return tempArray;
};

export const defaultRenderer = (element: React.ReactElement<any>): { html: string } => ({
  html: renderToString(element),
});

export const defaultRenderPage = ({
  req,
  Wrap,
  App,
  routes,
  data,
  props,
  renderer = defaultRenderer,
}: RenderPageParams) => {
  return async (): Promise<{
    html: string;
    bundles: PreloadAssets[];
    head: Array<React.ReactElement<any>>;
  }> => {
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
    const location = req.path;

    // Head provider
    const { HeadProvider, getHeads } = getHeadProvider();

    const asyncOrSyncRender = renderer(
      <Loadable.Capture report={reportResults}>
        <HeadProvider>
          <Wrap
            Container={ContainerComponent}
            App={App}
            containerProps={{ location, context: appContext, server: true }}
            appProps={{ ...{ location: { pathname: location }, ...appProps, routes, data } }}
            {...wrapProps}
          />
        </HeadProvider>
      </Loadable.Capture>,
    );

    const { html, ...rest } = isPromise(asyncOrSyncRender)
      ? await asyncOrSyncRender
      : asyncOrSyncRender;

    const head = getHeads() || defaultHead();

    const loadableFile = path.resolve(BUILD_DIR, CLIENT_BUILD_DIR, REACT_LOADABLE_MANIFEST);
    const reactLoadableJson = requireRuntime(loadableFile);

    const bundles: PreloadAssets[] = getBundles(reactLoadableJson, modules)
      .filter(Boolean) // removes falsy value
      .filter((b) => b.file.endsWith('.js')) // removes .map files
      .map((bundle) => ({
        // maps to readable bundle array
        name: bundle.name,
        filename: bundle.file,
      }));

    return { html, head, bundles, ...rest };
  };
};
