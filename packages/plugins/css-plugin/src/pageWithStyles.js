import React from 'react';
import T from 'prop-types';
import hoistNonReactStatics from 'hoist-non-react-statics';

export default (WrappedComponent) => {
  class PageWithStyles extends React.Component {
    static displayName = `<PageWithStyles Component={${WrappedComponent.displayName ||
      WrappedComponent.name ||
      'Component'}} />`;

    static defaultProps = {
      css: [],
    };

    static childContextTypes = {
      insertCss: T.func,
    };

    static getInitialProps(context) {
      if (typeof WrappedComponent.getInitialProps === 'function') {
        return WrappedComponent.getInitialProps.call(WrappedComponent, context);
      }

      return context;
    }

    getChildContext() {
      const { css } = this.props;

      let insertCss;

      if (typeof window === 'undefined') {
        insertCss = (...styles) => {
          styles.forEach((style) => {
            const cssText = style._getCss();
            if (!~css.indexOf(cssText)) {
              css.push(cssText);
            }
          });
        };
      } else {
        insertCss = (...styles) => {
          const removeCss = styles.map((x) => x._insertCss());

          return () => {
            removeCss.forEach((f) => f());
          };
        };
      }

      return { insertCss };
    }

    render() {
      const { css = [] } = this.props;

      // Only renders style on server
      // On client render, style will be moved to head
      // then remove style tag here
      return (
        <div>
          <WrappedComponent {...this.props} />
          {!!css.length && (
            <style className="_isl-styles" dangerouslySetInnerHTML={{ __html: css.join('') }} />
          )}
        </div>
      );
    }
  }

  return hoistNonReactStatics(PageWithStyles, WrappedComponent);
};
