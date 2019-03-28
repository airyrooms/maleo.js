import React from 'react';
import { default as Document, Header, Scripts, Main } from '@airy/maleo/document';

export default class CustomDocument extends Document {
  render() {
    return (
      <html lang="en">
        <Header>
          <meta charSet="utf-8" />
          <meta http-equiv="X-UA-Compatible" content="IE=edge" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />

          <link rel="manifest" href="/manifest.json" />
          <meta name="theme-color" content="#2F3BA2" />
          <title>Weather PWA</title>

          {/* Safari */}
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black" />
          <meta name="apple-mobile-web-app-title" content="Weather PWA" />
          <link rel="apple-touch-icon" href="images/icons/icon-152x152.png" />

          {/* Windows */}
          <meta name="msapplication-TileImage" content="images/icons/icon-144x144.png" />
          <meta name="msapplication-TileColor" content="#2F3BA2" />
        </Header>
        <body>
          <Main />
          <Scripts />
        </body>
      </html>
    );
  }
}
