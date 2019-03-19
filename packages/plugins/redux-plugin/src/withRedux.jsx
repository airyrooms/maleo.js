import React from 'react';
import { Provider } from 'react-redux';
import { STORE_KEY } from './const';

const isServer = typeof window === 'undefined';

export const withRedux = (makeStoreClient) => {
  return (App) =>
    class ReduxWrapper extends React.Component {
      static getInitialProps(ctx) {
        return {
          store: makeStoreClient(isServer, typeof window !== 'undefined' ? window[STORE_KEY] : {}),
        };
      }

      constructor(props) {
        super(props);
      }

      render() {
        const { store, ...props } = this.props;

        return (
          <Provider store={store}>
            <App store={store} {...props} />
          </Provider>
        );
      }
    };
};
