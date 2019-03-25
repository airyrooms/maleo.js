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

    return (
      <noscript
        id={STORE_KEY}
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(preloadedState),
        }}
      />
    );
  }
}
