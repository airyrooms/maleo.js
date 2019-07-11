import React from 'react';

import { default as Document, Header, Main, Scripts } from '@airy/maleo/document';
import { ReduxScript } from '@airy/maleo-redux-plugin';

export default class MyDocument extends Document {
  static getInitialProps = async (ctx) => {
    const initialProps = await Document.getInitialProps(ctx);

    console.log(process.env.NODE_ENV);
    return initialProps;
  };

  render() {
    return (
      <html>
        <Header />
        <body>
          <Main />

          <Scripts />

          <ReduxScript />
        </body>
      </html>
    );
  }
}
