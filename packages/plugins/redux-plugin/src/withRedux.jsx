import React from 'react';
import { Provider } from 'react-redux';
import { STORE_KEY } from './const';

const isServer = typeof window === 'undefined';

export const withRedux = (makeStoreClient) => {
  return (App) =>
    class ReduxWrapper extends React.Component {
      static getInitialProps(ctx) {
        if (isServer) {
          return {
            store: makeStoreClient(isServer, {}),
          };
        }

        const initialState = document.querySelectorAll('noscript#' + STORE_KEY).item(0);
        let data = {};

        if (initialState) {
          const { textContent } = initialState;
          data = JSON.parse(textContent || '');
        }

        return {
          store: makeStoreClient(isServer, data),
        };
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
