/**
 * Isomorphic CSS style loader for Webpack
 *
 * Copyright © 2015-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 *
 * https://github.com/kriasoft/isomorphic-style-loader/blob/master/src/withStyles.js
 */

import React from 'react';
import hoistStatics from 'hoist-non-react-statics';

import generateStyleContext from './StyleContext';

function withStyles(...styles) {
  return function wrapWithStyles(ComposedComponent) {
    const displayName = ComposedComponent.displayName || ComposedComponent.name || 'Component';
    const StyleContext = generateStyleContext();

    class WithStyles extends React.PureComponent {
      static displayName = `WithStyles(${displayName})`;
      static contextType = StyleContext;
      static ComposedComponent = ComposedComponent;

      constructor(props, context) {
        super(props, context);
        this.removeCss = context.insertCss(...styles);
      }

      componentWillUnmount() {
        if (this.removeCss) {
          setTimeout(this.removeCss, 0);
        }
      }

      render() {
        const { css } = this.context;
        const isServer = typeof window === 'undefined';

        return (
          <React.Fragment>
            <ComposedComponent {...this.props} />
            {isServer && !!css.length && (
              <style className="_isl-styles" dangerouslySetInnerHTML={{ __html: css.join('') }} />
            )}
          </React.Fragment>
        );
      }
    }

    return hoistStatics(WithStyles, ComposedComponent);
  };
}

export default withStyles;
