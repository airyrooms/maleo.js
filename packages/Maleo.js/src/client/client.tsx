import React from 'react';
import ReactDOM from 'react-dom';
import Loadable from 'react-loadable';

import { loadInitialProps, loadComponentProps } from '@routes/loadInitialProps';
import { InitialProps } from '@interfaces/render';
import { SERVER_INITIAL_DATA, DIV_MALEO_ID } from '@constants/index';
import { matchingRoutes } from '@routes/matching-routes';
import RE from './registerEntry';
import { ContainerComponent } from '@render/_container';
import { ClientManager, ManagerContext } from './client-manager';
import { promisify } from '@utils/index';

const routes = RE.findRegister('routes');
const Wrap = RE.findRegister('wrap');
const App = RE.findRegister('app');

export const init = async () => {
  try {
    const data = await ClientManager.getInitialProps({ routes });

    const appProps = {
      ...data.app,
      data,
      routes,
      location,
    };
    const containerProps = {};

    const wrapProps = {
      ...data.wrap,
      App,
      Container: ContainerComponent,
      appProps,
      containerProps,
    };

    // wrap able to set global function or value
    const { _global_ } = data.wrap;

    const { onBeforeRouteChange, onAfterRouteChange } = Wrap;
    // ManagerContext.Consumer is used here to ensure code consistency
    // that data from StateManager will always be passed as props not context
    const RenderApp = () => (
      <ClientManager
        data={data}
        routes={routes}
        _global_={_global_}
        hooks={{
          onBeforeRouteChange: promisify<Location, void>(onBeforeRouteChange),
          onAfterRouteChange: promisify<Location, void>(onAfterRouteChange),
        }}>
        <ManagerContext.Consumer>
          {({ data: { wrap: wrapInitialProps } }) => <Wrap {...wrapInitialProps} {...wrapProps} />}
        </ManagerContext.Consumer>
      </ClientManager>
    );

    hydrate(RenderApp);
  } catch (err) {
    // tslint:disable-next-line:no-console
    console.error(err);
  }
};

export const hydrate = (Application: () => React.ReactElement<any>): void => {
  Loadable.preloadReady().then(() => {
    ReactDOM.hydrate(<Application />, document.querySelector(`#${DIV_MALEO_ID}`));
  });
};

export const ensureReady = async (pathname, ctx): Promise<InitialProps['data']> => {
  const initialServerData = document.querySelectorAll('noscript#' + SERVER_INITIAL_DATA).item(0);

  if (!initialServerData) {
    return matchAndLoadInitialProps(pathname, ctx);
  }

  const { textContent } = initialServerData;
  const data = JSON.parse(textContent || '');

  // remove initial data after application
  // has been hydrated
  initialServerData.remove();

  // hydrate Wrap and App component initial props
  // pass the server props then client's hydrated props
  const { wrap, app } = await hydrateWrapAppProps(ctx);
  return {
    ...data,
    wrap: {
      ...data.wrap,
      ...wrap,
    },
    app: {
      ...data.app,
      ...app,
    },
  };
};

export const matchAndLoadInitialProps = async (pathname: string, ctx?) => {
  const matchedRoutes = await matchingRoutes(routes, pathname);
  const { data } = await loadInitialProps(matchedRoutes, ctx);

  const { wrap, app } = await hydrateWrapAppProps(ctx);

  return {
    ...data,
    wrap,
    app,
  };
};

//
export const hydrateWrapAppProps = async (ctx) => {
  const appProps = await loadComponentProps(App, ctx);
  const wrapProps = await loadComponentProps(Wrap, ctx);

  return {
    wrap: wrapProps,
    app: appProps,
  };
};
