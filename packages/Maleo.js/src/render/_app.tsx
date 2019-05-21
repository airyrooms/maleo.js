import React from 'react';
import { withRouter } from 'react-router-dom';

import { AppProps, InitialProps } from '@interfaces/render';
import { renderRoutes } from '@routes/routes';
import { StateContext } from '@client/client-state-manager';

export interface AppState {
  data?: InitialProps['data'];
  // @ts-ignore
  previousLocation: Location<any> | null;
}

export class _App extends React.PureComponent<AppProps, AppState> {
  static contextType = StateContext;

  // TODO: add prefetch data for next route
  prefetchCache = {};

  state = {
    data: this.context.data,
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
      const previousLocation = this.props.location;

      window.scrollTo(0, 0);
      this.setState({
        previousLocation,
      });

      this.context.clientRouteChange(nextLocation);

      this.setState({ previousLocation: null });
    }
  }

  render() {
    const { data, previousLocation } = this.state;
    const { routes, location } = this.props;
    const initialData = this.prefetchCache[location.pathname] || data;

    return renderRoutes(routes, {
      initialData,
      location: previousLocation || location,
    });
  }
}

export const App = withRouter<AppProps>(_App);
export default App;
