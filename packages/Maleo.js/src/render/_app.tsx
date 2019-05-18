import React from 'react';
import { withRouter } from 'react-router-dom';

import { AppProps, InitialProps } from '@interfaces/render';
// import { loadInitialProps } from '@server/loadInitialProps';
import { renderRoutes } from '@routes/routes';
import { matchAndLoadInitialProps } from '../client/client';

export interface AppState {
  data?: InitialProps['data'];
  // @ts-ignore
  previousLocation: Location<any> | null;
}

const isClient = typeof window !== 'undefined';

export class _App extends React.PureComponent<AppProps, AppState> {
  // TODO: add prefetch data for next route
  prefetchCache = {};

  state = {
    data: this.props.data,
    previousLocation: null,
  };

  // only runs on client side rendering during route changes
  // wrapper will expected to be called for every route changes inside the wrapper
  runComponentGetInitialProps = async (
    routes: AppProps['routes'],
    location: AppProps['location'],
  ) => {
    if (isClient) {
      const { data } = await matchAndLoadInitialProps(routes, location.pathname, {});
      this.setState({
        data,
      });
    }
  };

  componentWillReceiveProps = (nextProps: AppProps) => {
    const { location: nextLocation, routes } = nextProps;
    const { location } = this.props;

    const navigated = nextLocation.pathname !== location.pathname;
    if (navigated) {
      const previousLocation = this.props.location;

      window.scrollTo(0, 0);
      this.setState({
        data: undefined,
        previousLocation,
      });

      this.runComponentGetInitialProps(routes, nextLocation);

      // const { routes, location, ...rest } = nextProps;

      /* Do prefetch, but for now leave it as it is */
      // loadInitialProps(this.props.routes, nextProps.location.pathname, {
      //   location: nextProps.location,
      //   history: this.props.history,
      //   ...rest,
      // })
      //   .then(({ data }) => {
      //     this.setState({ previousLocation: null, data });
      //   })
      //   .catch(console.log);
      this.setState({ previousLocation: null });
    }
  };

  // prefetch = (pathname: string) => {
  //   loadInitialProps(this.props.routes, pathname, {
  //     history: this.props.history,
  //   })
  //     .then(({ data }) => {
  //       this.prefetchCache = {
  //         ...this.prefetchCache,
  //         [pathname]: data,
  //       };
  //     })
  //     .catch(console.log);
  // };

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
