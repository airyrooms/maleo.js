import React from 'react';
import { Link } from 'react-router-dom';
import Head from '@airy/maleo/head';

import Wrap from '@airy/maleo/wrap';
import pageWithStyles from '@airy/maleo-css-plugin/pageWithStyles';
import { withRedux } from '@airy/maleo-redux-plugin';

import { makeStoreClient } from './store';

@pageWithStyles
@withRedux(makeStoreClient)
export default class extends Wrap {
  static getInitialProps = async ({ store, routes, req }) => {
    // const response = await fetch('https://jsonplaceholder.typicode.com/todos/1');
    // const data = await response.json();
    const data = { initialData: true };

    return { data, store };
  };

  static onBeforeRouteChange = async (currentLocation, nextLocation) => {
    console.log('before route change', currentLocation, nextLocation);
  };

  static onAfterRouteChange = async (previousLocation, currentLocation) => {
    console.log('after route change', previousLocation, currentLocation);
    window.scrollTo(0, 0);
  };

  render() {
    const { Container, App, containerProps, appProps } = this.props;

    return (
      <Container {...containerProps}>
        <Head>
          <title>Hello World</title>
        </Head>
        <div>
          <h1>This is NAVBARRR</h1>
          <div>
            rooms main app
            <h1>rooms main app</h1>
            <ul>
              <li>
                <Link to="/">Root</Link>
              </li>
              <li>
                <Link to="/search">Search</Link>
              </li>
              <li>
                <Link to="/detail">Detail</Link>
              </li>
              <li>
                <Link to="/not-found">Not Found</Link>
              </li>
            </ul>
            <div>
              <App {...appProps} />
            </div>
          </div>
        </div>
      </Container>
    );
  }
}
