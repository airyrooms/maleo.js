import React from 'react';

import { _Wrap } from '@airy/zones/lib/render/_wrap';
import pageWithStyles from '@airy//css-plugin/lib/pageWithStyles';
import { withRedux } from '@airy/with-redux-plugin';

import { makeStoreClient } from './store';

@pageWithStyles
@withRedux(makeStoreClient)
export class Wrap extends _Wrap {
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
