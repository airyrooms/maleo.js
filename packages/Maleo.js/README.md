[![Build Status](https://travis-ci.org/airyrooms/maleo.js.svg?branch=master)](https://travis-ci.org/airyrooms/maleo.js)
[![Coverage Status](https://coveralls.io/repos/github/airyrooms/maleo.js/badge.svg?branch=master)](https://coveralls.io/github/airyrooms/maleo.js?branch=master)
[![npm version](https://badge.fury.io/js/%40airy%2Fmaleo.svg)](https://badge.fury.io/js/%40airy%2Fmaleo)
[![Issues](http://img.shields.io/github/issues/airyrooms/maleo.js.svg)]( https://github.com/airyrooms/maleo.js/issues)
[![MIT license](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/airyrooms/maleo.js/blob/canary/LICENSE)
[![Discord Chat](https://img.shields.io/discord/550498214789513218.svg)](https://discord.gg/9eArCQn)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-green.svg)](https://conventionalcommits.org)


# Welcome to Maleo.js

Maleo.js is an un-opinionated framework to enable Universal Rendering in JavaScript using React with no hassle.

We are here to solve the time consuming setups Universal Rendering Required.

---

Readme below is the documentation for the `canary` (prerelease) branch. To view the documentation for the latest stable Maleo.js version change branch to `master`

---

# Table of Contents
- [Features](#features)
- [Setup](#setup)
- [Component Lifecycle](#component-lifecycle)
- [Routing](#routing)
- [Dynamic Import Component](#dynamic-import-component)
  - [Tips](#tips)
  - [Preloading](#preloading)
- [Customizable Component](#customizable-component)
  - [Custom Document](#custom-document)
  - [Custom Wrap](#custom-wrap)
- [Custom Configuration](#custom-configuration)
  - [Customize Server](#customize-server)
  - [Customize Webpack](#customize-webpack)
  - [Customize Babel Config](#customize-babel-config)
- [Core Utilities Functions](#core-utilities-functions)
- [CDN Support](#cdn-support)
- [Plugins](#plugins)
- [FAQ](#faq)
- [Contributing](#contributing)

---

## Features
- Universal Rendering
- Plugin based framework
- Customizable

## Setup

Install Maleo.js 

>*for now change `@airy/maleo` to `@airy/maleo@canary` until we publish the stable version of this package*


**NPM**
```bash
$ npm install --save @airy/maleo react
```
**Yarn**
```bash
$ yarn add @airy/maleo react
```

Add this script to your `package.json`
```json
{
  "scripts": {
    "dev": "maleo dev",
    "build": "export NODE_ENV=production && maleo build",
    "start": "export NODE_ENV=production && maleo run"
  }
}
```

Create a page Root component
```jsx
// ./src/Root.jsx
import React from 'react';

// Export default is required for registering page
export default class RootComponent extends React.Component {
  render() {
    return (
      <h1>Hello World!</h1>
    )
  }
}
```

And lastly, create a routing file on your project root directory called `routes.json` and register your page component
```json
[
  {
    "path": "/",
    "page": "./src/Root"
  }
]
```

After that you can now run `$ npm run dev` and go to `http://localhost:3000`.

You should now see your app running on your browser.

By now you should see 
- Automatic transpilation and bundling (with webpack and babel)
- ~~Hot code reloading~~ [#17](https://github.com/airyrooms/maleo.js/issues/17)
- Server rendering

To see how simple this is, check out the sample app!

## Component Lifecycle 

Maleo.js added a new component lifecycle hook called `getInitialProps`, this function is called during Server Side Rendering (SSR) and during route changes on Client Side Rendering (CSR).

This is useful especially for SEO purposes. 

Example for stateful component:
```jsx
import React from 'react';

export default class extends React.Component {
  static getInitialProps = async (ctx) => {
    const { req } = ctx;

    // check if getInitialProps is called on server or on client
    const userAgent = req ? req.headers['user-agent'] : navigator.userAgent;

    // the return value will be passed as props for this component
    return { userAgent };
  }

  render() {
    return (
      <div>
        Hello World {this.props.userAgent}
      </div>
    );
  }
}
```

Example for stateless component:
```jsx
const Component = (props) => (
  <div>
    Hello World {props.userAgent}
  </div>
);

Component.getInitialprops = async (ctx) => {
  const { req } = ctx;

  const userAgent = req ? req.headers['user-agent'] : navigator.userAgent;

  return { userAgent };
};

export default Component;
```

`getInitialProps` receives a context object with the following properties:
- `req` - HTTP request object (server only)
- `res` - HTTP response object (server only)
- `...wrapProps` - Spreaded properties from custom Wrap
- `...appProps` - Spreaded properties from custom App

## Routing

Routing is declared in a centralized route config.
Register all the route config in `routes.json` file.

If you put the `routes.json` files on root directory, Maleo will automatically register your route. Otherwise put path to your routes on [Maleo config](#custom-configuration).

Routes file has to export default the route configuration.
The route object **expected to have distinct key** to indicate the route.

<table>
  <tr>
    <td>Key</td>
    <td>Type</td>
    <td>Description</td>
  </tr>
  <tr>
    <td><code>path</code></td>
    <td><code>String!</code></td>
    <td>Routes path</td>
  </tr>
  <tr>
    <td><code>page</code></td>
    <td><code>String!</code></td>
    <td>Path to React Component for this route path</td>
  </tr>
  <tr>
    <td><code>exact</code></td>
    <td><code>Boolean?</code> [<code>false</code>]</td>
    <td>To make url has to match exactly the path in order to render the component. Give <code>false</code> value if the route is a wrapper route component</td>
  </tr>
  <tr>
    <td><code>routes</code></td>
    <td><code>RouteObject?</code></td>
    <td>Nested route</td>
  </tr>
</table>


For example:
```json
[
  {
    "page": "./src/MainApp",
    "routes": [
      {
        "path": "/",
        "page": "./src/Search",
        "exact": true
      },
      {
        "path": "/search",
        "page": "./src/Search",
        "routes": [
          {
            "path": "/search/hello",
            "page": "./src/Detail",
            "exact": true
          }
        ]
      },
      {
        "path": "/detail",
        "page": "./src/Detail",
        "exact": true
      }
    ]
  }
]
```

## Dynamic Import Component
Maleo.js supports TC39 [dynamic import proposal](https://github.com/tc39/proposal-dynamic-import) for JavaScript.

You can think dynamic import as another way to split your code into manageable chunks. You can use our `Dynamic` function which utilizes [react loadable](https://github.com/jamiebuilds/react-loadable)

For Example
```js
// DynamicComponent.js
import Dynamic from '@airy/maleo/dynamic';

export default Dynamic({
  loader: () => import( /* webpackChunkName:"DynamicComponent" */ './component/DynamicLoad'),
})
```

### **Preloading**

For optimization purposes, you can also preload a component even before the component got rendered.

For example, if you want to load component when a button get pressed, you can start preloading the component when the user hovers the mouse over the button.

The component created by `Dynamic` exposes a [static `preload` method](https://github.com/jamiebuilds/react-loadable#loadablecomponentpreload).

```jsx
import React from 'react';
import Dynamic from '@airy/maleo/dynamic';

const DynamicBar = Dynamic({
  loader: () => import('./Bar'),
  loading: LoadingCompoinent
});

class MyComponent extends React.Component {
  state = { showBar: false };

  onClick = () => {
    this.setState({ showBar: true });
  };

  onMouseOver = () => DynamicBar.preload();

  render() {
    return (
      <div>
        <button
          onClick={this.onClick}
          onMouseOver={this.onMouseOver}>
          Show Bar
        </button>
        { this.state.showBar && <DynamicBar /> }
      </div>
    )
  }
}
```

## Customizable Component

### Custom Document

Highly inspired by what [Next.js](https://github.com/zeit/next.js) has done on their awesome template customization.

Maleo.js also enable customization on `Document` as document's markup. So you don't need to include tags like `<html>`, `<head>`, `<body>`, etc. 

To override the default behavior, you'll need to create a component that extends the `Document` React class provided by Maleo.

```jsx
// document.jsx
import React from 'react';
import { Document, Header, Main, Scripts } from '@airy/maleo/document';

export default class extends Document {
  render() {
    return (
      <html>
        <Header>
          <title>Maleo JS</title>
          <meta charset="utf-8" />
          <meta name="description" content="Maleo.js is awesome!" />

          <style>
            {` body { background-color: #fff } `}
          </style>
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
```

### Custom Wrap

Maleo.js uses the `Wrap` component to initialize pages. `Wrap` contains React Router's Component. You can add HoC here to wrap the application and control the page initialization. Which allows you to do amazing things like:
- Persisting layour between page changes
- Keeping state when navigating pages
- Custom error handling using `componentDidCatch`
- Inject additional data into pages (like Redux provider, etc)

To override the default behavior, you'll need to create a component that extends the `Wrap` React class provided by Maleo.

```jsx
// wrap.jsx
import React from 'react';
import { Wrap } from '@airy/maleo/wrap';

// Redux plugin for Maleo.js
// Hoc that creates store and add Redux Provider
import { withRedux } from '@airy/maleo-redux-plugin';

// Custom Wrapper that will be rendered for the whole Application
import Content from './component/Content';
import NavigationBar from './component/NavigationBar';

import { createStore } from './store';

@withRedux(createStore)
export default class extends Wrap {
  static getInitialProps = (ctx) => {
    const { store } = ctx
    // you receive store from context
    // you can access or do something with the store here
    console.log('Initialized Redux Store', store);
    return {}
  }

  render() {
    const { Container, containerProps, App, appProps } = this.props

    return (
      <Container {...containerProps}>
        <NavigationBar />
        <Content>
          <App {...appProps}/>
        </Content>
      </Container>
    )
  }
}

```
If you put `document.jsx` and `wrap.jsx` on root directory (the same level with `package.json`), then Maleo will automatically register your custom Document and Wrap. Otherwise, you can add the path to your custom Document and Wrap on [Maleo config](#custom-configuration)

---
***We are also working on adding default and customizable `Error` component page***

---

## Custom Configuration

For more advanced configuration of Maleo.js, like `webpack` config, registering `plugins`, path to your routes, custom Document and Wrap, and adding `path alias`, you can create a `maleo.config.js` in the root of your project directory. (same directory with `package.json`)

```js
// maleo.config.js

module.exports = {
  /* config options here */
}
```

Here are the API's for the configuration:

<table>
  <tr>
    <td>Key</td>
    <td>Type</td>
    <td>Description</td>
  </tr>
  <tr>
    <td><code>favicon</code></td>
    <td><code>String</code> [<code>{project-dir}/favicon.ico</code>]</td>
    <td>Path to favicon file</td>
  </tr>
  <tr>
    <td><code>buildDir</code></td>
    <td><code>String?</code> [<code>.maleo</code>]</td>
    <td>Directory to put Maleo.js' build assets</td>
  </tr>
  <tr>
    <td><code>cache</code></td>
    <td><code>Boolean?</code> [<code>true</code>]</td>
    <td>Enable webpack build caching</td>
  </tr>
  <tr>
    <td><code>isDev</code></td>
    <td><code>Boolean?</code> [<code>process.env.NODE_ENV === 'development'</code>]</td>
    <td>Enable development build configuration</td>
  </tr>
  <tr>
    <td><code>sourceMaps</code></td>
    <td><code>Boolean?</code> [<code>true</code>]</td>
    <td>Enable webpack to generate source maps</td>
  </tr>
  <tr>
    <td><code>alias</code></td>
    <td><code>Object?</code></td>
    <td>A key value pair for aliasing path directory
      <br>
      <code>
      { 'component': './src/component' }
      </code>
    </td>
  </tr>
  <tr>
    <td><code>publicPath</code></td>
    <td><code>String?</code> [<code>/_assets/</code>]</td>
    <td>To customize webpack's <code>publicPath</code> 
    <br>Comes in handy if using CDN to put built assets</td>
  </tr>
  <tr>
    <td><code>analyzeBundle</code></td>
    <td><code>Boolean?</code> [<code>false</code>]</td>
    <td>To enable webpack's bundle analyzer, for analyzing bundle sizes during bundle debugging should Maleo.js' build process got slow</td>
  </tr>
  <tr>
    <td><code>webpack</code></td>
    <td><code>Function?</code></td>
    <td>To customize webpack configuration, more details <a href="#customize-webpack">here</a></td>
  </tr>
  <tr>
    <td><code>routes</code></td>
    <td><code>string?</code> [<code>rootDir/routes.jsx</code>]</td>
    <td>Path to your routes file</td>
  </tr>
  <tr>
    <td><code>customDocument</code></td>
    <td><code>string?</code> [<code>rootDir/document.jsx</code>]</td>
    <td>Path to your custom document file</td>
  </tr>
  <tr>
    <td><code>customWrap</code></td>
    <td><code>string?</code> [<code>rootDir/wrap.jsx</code>]</td>
    <td>Path to your custom wrap file</td>
  </tr>
  <tr>
    <td><code>customApp</code></td>
    <td><code>string?</code> [<code>rootDir/app.jsx</code>]</td>
    <td>Path to your custom app file</td>
  </tr>
</table>

#### Customize Server

Create a `server.js` file on root directory where your `package.json` lives.
Here you can customize Maleo's server.
```js
import { Server } from '@airy/maleo/server';

const PORT = process.env.PORT || 3000;

const maleoServer = Server.init({
  port: PORT,
  runHandler: () => {
    console.log('Server running on port :', PORT);
  }
});

maleoServer.run();
```

Here are the API's for the configuration:

<table>
  <tr>
    <td>Key</td>
    <td>Type</td>
    <td>Description</td>
  </tr>
  <tr>
    <td><code>port</code></td>
    <td><code>Number?</code> [<code>3000</code>]</td>
    <td>Port to run Maleo server</td>
  </tr>
  <tr>
    <td><code>assetDir</code></td>
    <td><code>String?</code> [<code>'<root>/.maleo/client'</code>]</td>
    <td>Directory for all client related assets</td>
  </tr>
  <tr>
    <td><code>runHandler</code></td>
    <td><code>Function?</code></td>
    <td>Function called when maleo server starter</td>
  </tr>
  <tr>
    <td><code>csp</code></td>
    <td><code>cspConfig?</code> [<code>{
      directives: {
        defaultSrc: [`'self'`],
        styleSrc: [`'self'`],
      },
    }</code>]</td>
    <td>Config for <a href="https://developers.google.com/web/fundamentals/security/csp/">Content Security Policy</a>, using <a href="https://helmetjs.github.io/docs/csp/">Helmet-CSP</a></td>
  </tr>
</table>

#### Customize Webpack

You are able to extend Maleo.js' default webpack configuration by defining a function on `maleo.config.js`

```js
// maleo.config.js

module.exports = {
  webpack(config, context, next) {
    // Perform customizations to webpack config
    // Important: This call is required in order to let Maleo pass the config to webpack
    return next(); 
  },
};
```

Webpack function will receive three arguments:

<table>
  <tr>
    <td>Argument</td>
    <td>Details</td>
  <tr>
  <tr>
    <td><code>config</code></td>
    <td>This contains webpack configuration object that you can manipulate</td>
  <tr>
  <tr>
    <td><code>context</code></td>
    <td>This contains some keys that are useful for the build context
      <br>
      <table>
        <tr>
          <td><code>isDev</code></td>
          <td><code>Boolean</code></td>
          <td>Check if current build is for development</td>
        </tr>
        <tr>
          <td><code>publicPath</code></td>
          <td><code>String</code></td>
          <td>Public Path of user defined or default's value</td>
        </tr>
        <tr>
          <td><code>analyzeBundle</code></td>
          <td><code>Boolean</code></td>
          <td>Check if analyze bundle is enabled</td>
        </tr>
        <tr>
          <td><code>buildDirectory</code></td>
          <td><code>String</code></td>
          <td>Build Directory of user defined or default's value</td>
        </tr>
        <tr>
          <td><code>name</code></td>
          <td><code>String</code></td>
          <td>Build name <code>'server' || 'client'</code></td>
        </tr>
      </table>
    </td>
  <tr>
  <tr>
    <td><code>next</code></td>
    <td>A callback required to be called to pass the custom configuration</td>
  <tr>
</table>

Example of adding `ts-loader` through `maleo.config.js`:

```js
// maleo.config.js

// Partly taken and modified from @airy/maleo-ts-plugin source
// for simplicity purposes

module.exports = {
  webpack(config, context, next) {
    const { isDev } = context

    config.module.rules.push({
      test: /\.tsx?/,
      exclude: /node_modules/,
      use: [
        require.resolve('@airy/maleo/lib/build/loaders/maleo-babel-loader'),
        {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
          },
        },
      ],

      if (isDev) {
        config.plugins.push(new ForkTSCheckerWebpackPlugin());
      }

      return next();
    })
  },
};
```

#### Customize Babel Config

Maleo.js also let you have your own babel config. Just simply add `.babelrc` file at the root directory of your app.

You can include Maleo.js' babel preset in order to have latest JavaScript preset.

Here's an example of `.babelrc` file:
```json
{
  "presets": ["@airy/maleo/babel"],
  "plugins": []
}
```

The `@airy/maleo/babel` preset includes everything you need to get your development started. The preset includes:
- `@babel/preset-env`
- `@babel/preset-react`
- `@babel/plugin-proposal-class-properties`
- `@babel/plugin-proposal-decorators`
- `@babel/plugin-proposal-object-rest-spread`
- `@babel/plugin-transform-runtime`
- `react-loadable/babel`

## Core Utilities Functions

#### Route Matching

To use you can import the matching routes function like this:
```js
import { getMatchedRoutes } from '@airy/maleo/utils';
```

The function will return all matched routes and the route object from `routes.json`

## CDN Support

If you are using a CDN, you can set up the `publicPath` setting and configure your CDN's origin to resolve to the domain that Maleo.js is hosted on.

```js
// maleo.config.js

const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  assetPrefix: isProd && 'https://cdn.example.com';
}
```

## FAQ

== TO BE DETERMINED == 

## Plugins
- [css-plugin](https://github.com/airyrooms/maleo-plugins/tree/master/packages/css-plugin)
- [redux-plugin](https://github.com/airyrooms/maleo-plugins/tree/master/packages/redux-plugin)
- [typescript-plugin](https://github.com/airyrooms/maleo-plugins/tree/master/packages/typescript-plugin)
- [more](https://github.com/airyrooms/maleo-plugins)


## Contributing
[Please follow these steps to contribute to Maleo.js](https://github.com/airyrooms/maleo.js/blob/canary/CONTRIBUTING.md)

[Please follow these steps to contribute to Maleo.js' plugins](https://github.com/airyrooms/maleo-plugins#contributing-guidelines)


## Contributors

This project exists thanks to all the people who contribute. [Contribute](CONTRIBUTING.md).

Many thanks to our **[contributors](https://github.com/airyrooms/maleo.js/graphs/contributors)**!


## License

MIT