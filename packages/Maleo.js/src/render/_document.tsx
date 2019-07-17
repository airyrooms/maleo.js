import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { stringify } from 'flatted';

import { HeaderProps, DocumentProps, DocumentContext } from '@interfaces/render';
import { SERVER_INITIAL_DATA, DIV_MALEO_ID } from '@constants/index';

// Extendable document
export default class Document extends React.Component<DocumentProps, {}> {
  static getInitialProps = async (documentContext: DocumentContext) => {
    return documentContext;
  };

  static childContextTypes = {
    html: PropTypes.element.isRequired,
    head: PropTypes.arrayOf(PropTypes.element).isRequired,
    preloadScripts: PropTypes.array.isRequired,
    initialProps: PropTypes.any,
    branch: PropTypes.any,
    ctx: PropTypes.any.isRequired,
  };

  getChildContext = () => {
    const { preloadScripts, initialProps, html, head, branch, ...ctx } = this.props;
    return { preloadScripts, initialProps, html, head, branch, ctx };
  };

  render() {
    return (
      <html lang="en">
        <Header />

        <body>
          <Main />

          <Scripts />
        </body>
      </html>
    );
  }
}

// Preloads scripts or styles to improve performance
// as preload scripts or styles don't block the thread
export class Header extends React.Component<HeaderProps, {}> {
  static contextTypes = {
    preloadScripts: PropTypes.array.isRequired,
    head: PropTypes.arrayOf(PropTypes.element).isRequired,
  };

  preloadScripts = () => {
    const { preloadScripts } = this.context;

    return preloadScripts.map((p, i) => (
      <link rel="preload" key={p.name} href={`${WEBPACK_PUBLIC_PATH}${p.filename}`} as="script" />
    ));
  };

  render() {
    const { head } = this.context;
    const { children } = this.props;

    return (
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, minimum-scale=1, initial-scale=1.0" />
        <meta httpEquiv="X-UA-Compatible" content="ie=edge" />

        {children}
        {head}

        {this.preloadScripts()}
      </head>
    );
  }
}

// Where the application lives
export class Main extends React.Component {
  static contextTypes = {
    html: PropTypes.any,
  };

  render() {
    return <div id={DIV_MALEO_ID} dangerouslySetInnerHTML={{ __html: this.context.html }} />;
  }
}

// Renders initial data as script and preloaded scripts as async
export class Scripts extends React.Component {
  static contextTypes = {
    preloadScripts: PropTypes.any,
    initialProps: PropTypes.any,
  };

  render() {
    const { preloadScripts, initialProps } = this.context;

    return (
      <Fragment>
        <noscript
          id={SERVER_INITIAL_DATA}
          dangerouslySetInnerHTML={{
            __html: stringify(initialProps),
          }}
        />
        {preloadScripts.map((p, i) => (
          <script key={i} src={`${WEBPACK_PUBLIC_PATH}${p.filename}`} defer />
        ))}
      </Fragment>
    );
  }
}
