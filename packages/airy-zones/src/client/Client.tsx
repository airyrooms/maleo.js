import React from 'react';
import ReactDOM from 'react-dom';
import Loadable from 'react-loadable';
import { hot } from 'react-hot-loader';

import { loadInitialProps, loadComponentProps } from '@server/loadInitialProps';
import { App as DefaultApp } from '@render/_app';
import { _Wrap as DefaultWrap } from '@render/_wrap';
import { InitialProps } from '@interfaces/render/IRender';
import { SERVER_INITIAL_DATA, DIV_ZONES_ID } from '@src/constants';
import { matchingRoutes } from '@server/routeHandler';

export const init = async (routes, mod, { Wrap = DefaultWrap, App = DefaultApp }) => {
  const { data } = await ensureReady(routes, location.pathname, {});

  const wrapProps = await loadComponentProps(Wrap);
  const appProps = await loadComponentProps(App);

  const RenderApp = hot(mod)(() => (
    <Wrap {...wrapProps}>
      <App data={data} routes={routes} {...appProps} {...wrapProps} />
    </Wrap>
  ));

  hydrate(RenderApp);
};

export const hydrate = (App: () => React.ReactElement<any>): void => {
  Loadable.preloadReady().then(() => {
    ReactDOM.hydrate(<App />, document.querySelector(`#${DIV_ZONES_ID}`));
  });
};

export const ensureReady = async (routes, pathname, ctx): Promise<InitialProps> => {
  const initialServerData = window[SERVER_INITIAL_DATA];

  if (!initialServerData) {
    const matchedRoutes = matchingRoutes(routes, pathname);
    return loadInitialProps(matchedRoutes, ctx);
  }

  return {
    data: initialServerData,
  };
};
