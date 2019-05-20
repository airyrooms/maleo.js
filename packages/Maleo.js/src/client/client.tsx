import React from 'react';
import ReactDOM from 'react-dom';
import Loadable from 'react-loadable';

import { loadInitialProps, loadComponentProps } from '@routes/loadInitialProps';
import { InitialProps } from '@interfaces/render';
import { SERVER_INITIAL_DATA, DIV_MALEO_ID } from '@constants/index';
import { matchingRoutes } from '@routes/matching-routes';
import { RegisterEntry } from './registerEntry';
import { ContainerComponent } from '@render/_container';

export const init = async () => {
  try {
    const RE = new RegisterEntry();

    const routes = RE.findRegister('routes');
    const Wrap = RE.findRegister('wrap');
    const App = RE.findRegister('app');

    const { data } = await ensureReady(routes, location.pathname, {});

    // Run getInitialProps on client as well
    const wrapInitialProps = await loadComponentProps(Wrap);
    const appInitialProps = await loadComponentProps(App);

    const appProps = {
      ...appInitialProps,
      data,
      routes,
      location,
    };
    const containerProps = {};

    const RenderApp = () => (
      <Wrap
        App={App}
        Container={ContainerComponent}
        appProps={appProps}
        containerProps={containerProps}
        {...wrapInitialProps}
      />
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
  const initialServerData = document.querySelectorAll('noscript#' + SERVER_INITIAL_DATA).item(0);

  if (!initialServerData) {
    return matchAndLoadInitialProps(routes, pathname, ctx);
  }

  const { textContent } = initialServerData;
  const data = JSON.parse(textContent || '');

  // remove initial data after application
  // has been hydrated
  initialServerData.remove();

  return {
    data,
  };
};

export const matchAndLoadInitialProps = async (routes, pathname, ctx) => {
  const matchedRoutes = await matchingRoutes(routes, pathname);
  return loadInitialProps(matchedRoutes, ctx);
};
