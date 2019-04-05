import React from 'react';
import { Link } from 'react-router-dom';

import Wrap from '@airy/maleo/wrap';
import pageWithStyles from '@airy/maleo-css-plugin/pageWithStyles';
import { withRedux } from '@airy/maleo-redux-plugin';

import { makeStoreClient } from './store';

@pageWithStyles
@withRedux(makeStoreClient)
export default class extends Wrap {
  static getInitialProps = async ({ store, ...context }) => {
    // const response = await fetch('https://jsonplaceholder.typicode.com/todos/1');
    // const data = await response.json();
    const data = { initialData: true };
    console.log('GIP wrap store', store);

    if (store) {
      store.dispatch({ type: 'TEST', data: 'testttt' });
    }

    return { data, store };
  };

  render() {
    const { Container, App, containerProps, appProps } = this.props;

    return (
      <Container {...containerProps}>
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
