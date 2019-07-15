import React from 'react';
import { withRouter } from 'react-router-dom';

import { AppProps, InitialProps } from '@interfaces/render';
import { renderRoutes } from '@routes/routes';
import { ManagerContext } from '@client/client-manager';

export interface AppState {
  data?: InitialProps['data'];
  // @ts-ignore
  currentLocation: Location<any> | null;
  // @ts-ignore
  previousLocation: Location<any> | null;
}

export class _App extends React.PureComponent<AppProps, AppState> {
  static contextType = ManagerContext;

  // TODO: add prefetch data for next route
  prefetchCache = {};
  routeTimeout;

  state = {
    data: this.context.data,
    currentLocation: this.props.location,
    previousLocation: null,
  };

  componentWillReceiveProps(nextProps: AppProps, nextContext) {
    // update data from context
    this.setState({
      data: nextContext.data,
    });

    const { location: nextLocation } = nextProps;
    const { location } = this.props;

    const navigated = nextLocation.pathname !== location.pathname;
    clearTimeout(this.routeTimeout);
    if (navigated) {
      const {
        clientRouteChange,
        hooks: { onBeforeRouteChange, onAfterRouteChange },
      } = this.context;

      // Run hook for before route change
      // Block render until hook finished
      onBeforeRouteChange(location, nextLocation).then(() => {
        // Wait until context has finished fetching all the initial props
        // to navigate and render new route
        clientRouteChange(nextLocation).then(() => {
          // Hacky fix
          // To prevent route changes when GIP promise has been resolved
          // has to wait for all the code in GIP to be done then change route
          this.routeTimeout = setTimeout(() => {
            clearTimeout(this.routeTimeout);

            this.setState(
              {
                currentLocation: nextLocation,
                previousLocation: location,
              },
              () => {
                // Run hook for after route changes
                onAfterRouteChange(location, nextLocation);
              },
            );

            this.setState({ previousLocation: null });
          }, 101);
        });
      });
    }
  }

  render() {
    const { data, previousLocation, currentLocation } = this.state;
    const { routes } = this.props;

    const initialData = this.prefetchCache[currentLocation.pathname] || data;

    const location = previousLocation || currentLocation;

    return renderRoutes(
      routes,
      {
        initialData,
        location,
      },
      {
        location,
      },
    );
  }
}

export const App = withRouter<AppProps>(_App);
export default App;
