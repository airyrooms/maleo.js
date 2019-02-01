import React from 'react';
import { withRouter } from 'react-router-dom';

import { AppProps, InitialProps } from '@interfaces/render/IRender';
// import { loadInitialProps } from '@server/loadInitialProps';
import { renderRoutes } from '@routes/routes';

export interface AppState {
  data?: InitialProps['data'];
  previousLocation: Location<any> | null;
}

class _App extends React.PureComponent<AppProps, AppState> {
  prefetchCache = {};

  state = {
    data: this.props.data,
    previousLocation: null,
  };

  static getInitialProps = async (ctx) => {
    return ctx;
  };

  componentWillReceiveProps = (nextProps: AppProps) => {
    const navigated = nextProps.location !== this.props.location;
    if (navigated) {
      const previousLocation = this.props.location;

      window.scrollTo(0, 0);
      this.setState({
        data: undefined,
        previousLocation,
      });

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
