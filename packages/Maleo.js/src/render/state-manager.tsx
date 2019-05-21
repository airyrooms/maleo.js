import React from 'react';

import { ensureReady } from '@client/client';

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

  updateData = (data) => this.setState({ data });

  render() {
    return (
      <StateContext.Provider
        value={{ updateData: this.updateData, data: this.state.data, routes: this.props.routes }}>
        {this.props.children}
      </StateContext.Provider>
    );
  }
}

export default StateManager;
