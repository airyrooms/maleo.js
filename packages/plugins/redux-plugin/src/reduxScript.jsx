import React from 'react';
import PropTypes from 'prop-types';
import { STORE_KEY } from './const';

export class ReduxScript extends React.Component {
  static contextTypes = {
    ctx: PropTypes.any,
  };
  render() {
    const { store } = this.context.ctx;
    const preloadedState = store.getState();
    const preloadedStateStr = JSON.stringify(preloadedState);
    return (
      <script
        dangerouslySetInnerHTML={{
          __html: `window.${STORE_KEY} = ${preloadedStateStr}`,
        }}
      />
    );
  }
}
