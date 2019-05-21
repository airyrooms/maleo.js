import React from 'react';

import { ensureReady, matchAndLoadInitialProps } from './client';

export const StateContext = React.createContext({
  data: {
    wrap: {},
    app: {},
  },
  routes: undefined,
});

export interface stateManagerProps {
  data?: any;
  routes: any;
}

export class StateManager extends React.PureComponent<stateManagerProps> {
  static getInitialProps = async (context?): Promise<{ [key: string]: any }> => {
    const isServer = typeof window === 'undefined';

    // client side data hydration
    if (!isServer) {
      const data = await ensureReady(location.pathname, context);
      return data;
    }

    return {};
  };

  state = {
    data: this.props.data || {},
  };

  // only runs on client side rendering during route changes
  // wrapper will expected to be called for every route changes inside the wrapper
  clientRouteChangesUpdate = async (location: Location) => {
    const data = await matchAndLoadInitialProps(location.pathname);

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
