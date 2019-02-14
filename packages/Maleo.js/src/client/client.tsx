import React from 'react';
import ReactDOM from 'react-dom';
import Loadable from 'react-loadable';

import { loadInitialProps, loadComponentProps } from '@server/loadInitialProps';
import { InitialProps } from '@interfaces/render/IRender';
import { SERVER_INITIAL_DATA, DIV_MALEO_ID } from '@constants/index';
import { matchingRoutes } from '@server/routeHandler';
import { RegisterEntry } from './registerEntry';

export const init = async () => {
  try {
    const RE = new RegisterEntry();

    const routes = RE.findRegister('routes');
    const Wrap = RE.findRegister('wrap');
    const App = RE.findRegister('app');

    const { data } = await ensureReady(routes, location.pathname, {});

    const wrapProps = await loadComponentProps(Wrap);
    const appProps = await loadComponentProps(App);

    const RenderApp = () => (
      <Wrap {...wrapProps}>
        <App data={data} routes={routes} {...appProps} {...wrapProps} />
      </Wrap>
    );

    hydrate(RenderApp);
  } catch (err) {
    // tslint:disable-next-line:no-console
    console.error(err);
  }
};

export const hydrate = (App: () => React.ReactElement<any>): void => {
  Loadable.preloadReady().then(() => {
    ReactDOM.hydrate(<App />, document.querySelector(`#${DIV_MALEO_ID}`));
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
