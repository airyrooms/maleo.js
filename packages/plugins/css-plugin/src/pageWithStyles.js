import React from 'react';
import hoistStatics from 'hoist-non-react-statics';

import generateStyleContext from './StyleContext';

export default (WrappedComponent) => {
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
  const StyleContext = generateStyleContext();

  class PageWithStyles extends React.Component {
    static displayName = `<PageWithStyles Component={${displayName}} />`;

    static getInitialProps(context) {
      if (typeof WrappedComponent.getInitialProps === 'function') {
        return WrappedComponent.getInitialProps.call(WrappedComponent, context);
      }

      return context;
    }

    render() {
      // Only renders style on server
      // On client render, style will be moved to head
      // then remove style tag here
      return (
        <StyleContext.Provider>
          <WrappedComponent {...this.props} />
        </StyleContext.Provider>
      );
    }
  }

  return hoistStatics(PageWithStyles, WrappedComponent);
};
