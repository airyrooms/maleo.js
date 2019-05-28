import React from 'react';
import { withRouter } from 'react-router-dom';

import { AppProps, InitialProps } from '@interfaces/render';
import { renderRoutes } from '@routes/routes';
import { StateContext } from '@client/client-state-manager';

export interface AppState {
  data?: InitialProps['data'];
  // @ts-ignore
  currentLocation: Location<any> | null;
  // @ts-ignore
  previousLocation: Location<any> | null;
}

export class _App extends React.PureComponent<AppProps, AppState> {
  static contextType = StateContext;

  // TODO: add prefetch data for next route
  prefetchCache = {};

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
    if (navigated) {
      // Wait until context has finished fetching all the initial props
      // to navigate and render new route
      this.context.clientRouteChange(nextLocation).then(() => {
        const previousLocation = this.props.location;

        window.scrollTo(0, 0);
        this.setState({
          currentLocation: nextLocation,
          previousLocation,
        });

        this.setState({ previousLocation: null });
      });
    }
  }

  render() {
    const { data, previousLocation, currentLocation } = this.state;
    const { routes } = this.context;
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
