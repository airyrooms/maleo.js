import React from 'react';

import Wrap from '@airy/maleo/wrap';
import pageWithStyles from '@airy/maleo-css-plugin/lib/pageWithStyles';
import { withRedux } from '@airy/maleo-redux-plugin';

import { makeStoreClient } from './store';

@pageWithStyles
@withRedux(makeStoreClient)
export default class extends Wrap {
  static getInitialProps = ({ store }) => {
    console.log('\nGIP wrap store', store);
  };

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <h1>This is NAVBARRR</h1>
        {super.render()}
      </div>
    );
  }
}