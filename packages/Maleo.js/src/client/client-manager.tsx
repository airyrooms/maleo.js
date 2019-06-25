import React from 'react';

import { ensureReady, matchAndLoadInitialProps } from './client';

const defaultData = {
  wrap: {},
  app: {},
};

export const ManagerContext = React.createContext({
  data: defaultData,
  routes: undefined,
  hooks: {},
});

export interface ClientManagerProps {
  data?: any;
  _global_?: any;
  routes: any;
  hooks: {
    onBeforeRouteChange: (currentLocation: Location, nextLocation: Location) => Promise<void>;
    onAfterRouteChange: (previousLocation: Location, currentLocation: Location) => Promise<void>;
  };
}

export class ClientManager extends React.PureComponent<ClientManagerProps> {
  static getInitialProps = async (context?): Promise<{ [key: string]: any }> => {
    const isServer = typeof window === 'undefined';

    // client side data hydration
    if (!isServer) {
      const data = await ensureReady(location.pathname, context);
      return data;
    }

    return defaultData;
  };

  state = {
    data: this.props.data || defaultData,
  };

  // only runs on client side rendering during route changes
  // wrapper will expected to be called for every route changes inside the wrapper
  clientRouteChangesUpdate = async (location: Location) => {
    const { routes, _global_ } = this.props;

    const ctx = { routes, _global_ };
    const data = await matchAndLoadInitialProps(location.pathname, ctx);

    this.setState({
      data,
    });
  };

  render() {
    const { data } = this.state;
    const { routes, hooks } = this.props;

    return (
      <ManagerContext.Provider
        value={{
          // @ts-ignore
          clientRouteChange: this.clientRouteChangesUpdate,
          data,
          routes,
          hooks,
        }}>
        {this.props.children}
      </ManagerContext.Provider>
    );
  }
}

export default ClientManager;
