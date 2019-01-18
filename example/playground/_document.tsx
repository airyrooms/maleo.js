import React from 'react';

import { Document, Header, Main, Scripts } from '@airy/zones/lib/render/_document';
import { ReduxScript } from '@airy/with-redux-plugin';

export class MyDocument extends Document {
  static getInitialProps = async (ctx) => {
    const initialProps = await Document.getInitialProps(ctx);

    return { ...initialProps };
  };

  render() {
    return (
      <html>
        <Header>
          <title>Example Airy Zonesssss</title>
        </Header>

        <body>
          <Main />

          <Scripts />

          <ReduxScript />
        </body>
      </html>
    );
  }
}
