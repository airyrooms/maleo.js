import React from 'react';

import { ensureReady, matchAndLoadInitialProps } from './client';

const defaultData = {
  wrap: {},
  app: {},
};

export const StateContext = React.createContext({
  data: defaultData,
  routes: undefined,
});

export interface StateManagerProps {
  data?: any;
  _global_?: any;
  routes: any;
}

export class StateManager extends React.PureComponent<StateManagerProps> {
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
    const { routes } = this.props;

    return (
      <StateContext.Provider
        value={{
          // @ts-ignore
          clientRouteChange: this.clientRouteChangesUpdate,
          data,
          routes,
        }}>
        {this.props.children}
      </StateContext.Provider>
    );
  }
}

export default StateManager;
