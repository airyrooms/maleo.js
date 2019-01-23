# Welcome to Maleo.JS

Maleo.JS is an un-opinionated framework to enable Universal Rendering in JavaScript using React with no hassle.

We are here to solve the time consuming setups Universal Rendering Required.

---

Readme below is the documentation for the `canary` (prerelease) branch. To view the documentation for the latest stable Maleo.JS version change branch to `master`

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
  - [Customize Webpack](#customize-webpack)
  - [Customize Babel Config](#customize-babel-config)
- [CDN Support](#cdn-support)
- [FAQ](#faq)
- [Contributing](#contributing)

---

## Features
- Universal Rendering
- Plugin based framework
- Customizable

## Setup

Install Maleo.JS 

**NPM**
```bash
$ npm install --save @airy/maleo react react-router-dom
```
**Yarn**
```bash
$ yarn add @airy/maleo react react-router-dom
```

Add this script to your `package.json`
```json
{
  "scripts": {
    "dev": "maleo run",
    "build": "export NODE_ENV=production && maleo build",
    "start": "export NODE_ENV=production && node .maleo/server.js"
  }
}
```

Create a routing file called `routes.js`
```jsx
import React from 'react';

const App = () => (<h1>Hello World</h1>);

export default [
  {
    path: '/',
    component: App,
    key: 'root',
  },
];
```

And then create a `server.js` file

Here you can customize Maleo's server.
```js
import { Server } from '@airy/maleo/server';
import path from 'path';

import routeConfig from './routes';

const PORT = process.env.PORT || 8080;

const maleoServer = Server.init({
  port: PORT,
  routes: routeConfig,
});

maleoServer.run(() => {
  console.log('Server running on port :', PORT);
});
```

And lastly create a `client.js` file
```js
import { init } from '@airy/maleo/client';

import routes from './routes';

init(routes, module);
```

After that you can now run `$ npm run dev` and go to `http://localhost:3000`.

You should now see your app running on your browser.

By now you should see 
- Automatic transpilation and bundling (with webpack and babel)
- Hot code reloading
- Server rendering

To see how simple this is, check out the sample app!

## Component Lifecycle 

Maleo.JS added a new component lifecycle hook called `getInitalProps`, this function is called during Server Side Rendering (SSR).

This is useful especially for SEO purposes. 

Example for stateful component:
```jsx
import React from 'react';

export default class extends React.Component {
  static getInitialProps = async (ctx) => {
    const { req } = ctx;

    const userAgent = req ? req.headers['user-agent'] : navigator.userAgent;

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

Routing are declared as a centralized route config.
Register all the route config in `routes.js` file.

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
    <td>React Router path string</td>
  </tr>
  <tr>
    <td><code>component</code></td>
    <td><code>React.Component!</code></td>
    <td>React Component to render on this route. You can use <code>this.props.children</code> to make the component as a Wrapper and render the child routes</td>
  </tr>
  <tr>
    <td><code>key</code></td>
    <td><code>String!</code></td>
    <td>Distinct or unique key to identify the route</td>
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
```js
// routes.js
export default [
  // wrapper route
  {
    path: '/',
    component: SomeWrapperComponent,
    key: 'root-Wrapper', // distinct key to indicate the route
    // declare routes inside this wrapper
    routes: [
      // nested route
      {
        path: '/',
        key: 'root-Page',
        component: RootPageComponent,
        exact: true, // indicate that the path has to be exact
      },
      // this route receives wrapper from root 
      // and declare other wrapper inside it for other routes
      {
        path: '/some-url',
        key: 'someUrl-Wrapper',
        component: SomeURLWrapper,
        routes: [
          {
            path: '/some-url/hello',
            key: 'someUrl-HelloPage',
            component: SomeURLHelloPage,
            exact: true,
          }
        ],
      },
    ],
  },
];
```

## Dynamic Import Component
Maleo.JS supports TC39 [dynamic import proposal](https://github.com/tc39/proposal-dynamic-import) for JavaScript.

You can think dynamic import as another way to split your code into manageable chunks. You can use our `Dynamic` function which utilizes [react loadable](https://github.com/jamiebuilds/react-loadable)

For Example
```js
// DynamicComponent.js
import Dynamic from '@airy/maleo/dynamic';

export default Dynamic({
  loader: () => import('./component/DynamicLoad' /* webpackChunkName:"DynamicComponent" */),
})
```

### **Tips**

This dynamic import best used for splitting routes based component.

For Example:

```jsx
import Dynamic from '@airy/maleo/dynamic';

export default [
  {
    path: '/',
    component: Dynamic({
      loader: () => import('./component/RootComponent' /* webpackChunkName:"RootComponent" */),
    }),
    key: 'root-RootComponent',
    exact: true,
  },
  {
    path: '/hello-world',
    component: Dynamic({
      loader: () => import('./component/HelloWorldComponent' /* webpackChunkName: "HelloWorldComponent" */),
    }),
    key: 'hello-world-HelloWorldComponent',
    exact: true,
  }
]
```

### **Preloading**

For optimization purposes, you can also preload a component even before the component got rendered.

For example, if you want to load a when a button get pressed, you can start preloading the component when the user hovers the mouse over the button.

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

Maleo.JS also enable customization on `Document` as document's markup. So you don't need to include tags like `<html>`, `<head>`, `<body>`, etc. 

To override the default behavior, you'll need to create a component that extends the `Document` React class provided by Maleo.

```jsx
// _document.jsx
import React from 'react';
import { Document, Header, Main, Scripts } from '@airy/maleo/Document';

export default class extends Document {
  render() {
    return (
      <html>
        <Header>
          <title>Maleo JS</title>
          <meta charset="utf-8" />
          <meta name="description" content="Maleo.JS is awesome!" />

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

Maleo.JS uses the `Wrap` component to initialize pages. `Wrap` contains React Router's Component. You can add HoC here to wrap the application and control the page initialization. Which allows you to do amazing things like:
- Persisting layour between page changes
- Keeping state when navigating pages
- Custom error handling using `componentDidCatch`
- Inject additional data into pages (like Redux provider, etc)

To override the default behavior, you'll need to create a component that extends the `Wrap` React class provided by Maleo.

```jsx
// _wrap.jsx
import React from 'react';
import { Wrap } from '@airy/maleo/Wrap';

// Redux plugin for Maleo.JS
// Hoc that creates store and add Redux Provider
import { withRedux } from '@airy/maleo-redux-plugin';

// Custom Wrapper that will be rendered for the whole Application
import CustomWrapper from './component/CustomWrapper';

import { createStore } from './store';

@withRedux(createStore)
export default class extends Wrap {
  static getInitialProps = (ctx) => {
    const { store } = ctx
    // you receive store from context
    // you can access or do something with the store here
    console.log('Initialized Redux Store', store);
  }

  render() {
    return (
      <CustomWrapper>
        {super.render()}
      </CustomWrapper>
    )
  }
}

```


After that register the all custom `Document` or `Wrap` to your `server.js` file. like so:

```
...

import CustomDocument from './_document';
import CustomWrap from './_wrap';

...

const maleoServer = Server.init({
  ...
  _document: CustomDocument,
  _wrap: CustomWrap,
  ...
});

...
```

For Custom `Wrap` you'll need to register it on `client.js` as well.

```js
import { init } from '@airy/maleo/Client';

import routeConfig from './routes';
import CustomWrap from './_wrap';

init(routeConfig, module, { Wrap: CustomWrap });
```
---

***We are currently working on automatic custom `Document` and `Wrap` registration***

***For now you can register the component like the example above***

***We are also working on adding default and customizable `Error` component page***

---

## Custom Configuration

For more advanced configuration of Maleo.JS, like `webpack` config, registering `plugins`, and adding `path alias`, you can create a `maleo.config.js` in the root of your project directory. (same directory with `package.json`)

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
    <td><code>buildDir</code></td>
    <td><code>String?</code> [<code>.maleo</code>]</td>
    <td>Directory to put Maleo.JS' build assets</td>
  </tr>
  <tr>
    <td><code>cache</code></td>
    <td><code>Boolean?</code> [<code>true</code>]</td>
    <td>Enable webpack build caching</td>
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
    <td>To enable webpack's bundle analyzer, for analyzing bundle sizes during bundle debugging should Maleo.JS' build process got slow</td>
  </tr>
  <tr>
    <td><code>webpack</code></td>
    <td><code>Function?</code></td>
    <td>To customize webpack configuration, more details <a href="#customize-webpack">here</a></td>
  </tr>
</table>

#### Customize Webpack

You are able to extend Maleo.JS' default webpack configuration by defining a function on `maleo.config.js`

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

Maleo.JS also let you have your own babel config. Just simply add `.babelrc` file at the root directory of your app.

You can include Maleo.JS' babel preset in order to have latest JavaScript preset.

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
- `react-hot-loader/babel`
- `react-loadable/babel`

## CDN Support

If you are using a CDN, you can set up the `publicPath` setting and configure your CDN's origin to resolve to the domain that Maleo.JS is hosted on.

```js
// maleo.config.js

const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  assetPrefix: isProd && 'https://cdn.example.com';
}
```

## FAQ


## Contributing
[Please follow these steps to contribute](https://github.com/airyrooms/maleo.js/blob/canary/CONTRIBUTING.md)
