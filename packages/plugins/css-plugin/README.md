# Maleo CSS Plugin

CSS support for [Maleo](https://github.com/airyrooms/maleo.js) capable of extracting css to single css file or route based css files, and server side rendering css.

## Installation
**NPM**
```bash
$ npm install --save @airy/maleo-css-plugin
```
**Yarn**
```bash
$ yarn add @airy/maleo-css-plugin
```

## How To Use

### Basic Usage
Add maleo css plugin to your `maleo.config.js` file.
```javascript
// maleo.config.js
const cssPlugin = require('@airy/maleo-css-plugin');

module.exports = cssPlugin();
```

Then you can import your css files to our custom `Wrap` component and your CSS will be available for all page.

```css
/* style.css */
.wrapper {
  height: 100%;
  width: 100%;
  background-color: red; /* why not 😉 */
}
```

```jsx
// _wrap_.jsx
import React from 'react';
import Wrap from '@airy/maleo/wrap';

import './style.css';

export default class CustomWrap extends Wrap {}
```

Now all your component able to use the CSS you have defined, for example
```jsx
// Component.jsx
import React from 'react';

export default class Component extends React.Component {
  render() {
    // This component will have the .wrapper style we defined above
    return (
      <div className="wrapper">
        <h1>Hello World</h1>
      </div>
    )
  }
}
```

---

### Advanced Usage

#### With CSS Modules
A CSS Module is a CSS file in which all class names and animation names are scoped locally by default. Maleo-css-plugins uses [css-loader](https://github.com/webpack-contrib/css-loader), and you can configure the `css-loader` at `maleo.config.js` through `cssPluginOptions.cssLoader` options key.

For example:
```javascript
// maleo.config.js
const cssPlugin = require('@airy/maleo-css-plugin');

module.exports = cssPlugin({
  cssPluginOptions: {
    cssLoader: {
      modules: true, // Add this line
      localIdentName: '[path][name]__[local]--[hash:base64:5]', // Optional default: '[hash:base64]'
      // other options
      // url: true,
      // import: true,
      // context: undefined,
      // hashPrefix: undefined,
      // getLocalIdent: undefined,
      // sourceMap: false,
      // camelCase: false,
      // importLoaders: 0,
      // exportOnlyLocals: false,
    },
  },
});
```

And now on your code you can import your CSS file as such:
```jsx
// Component.jsx
import React from 'react';

import style from './style.css';

export default class Component extends React.Component {
  render() {
    // This component will have the .wrapper style we defined above
    return (
      <div className={style.wrapper}>
        <h1>Hello World</h1>
      </div>
    )
  }
}
```

---
More options can be found here [css-loader](https://github.com/webpack-contrib/css-loader#options)

---

#### Enable Isomorphic Style Loader
Isomorphic Style Loader is a CSS style loader for Webpack that is optimized for isomorphic (universal) web apps. [more](https://github.com/kriasoft/isomorphic-style-loader)

By enabling ISL, you gain server side rendering with style but you can not use this when you enable extract css feature. Since it doesn't make sense to have different ways of styling both during SSR and on CSR.

To enable ISL:
```javascript
// maleo.config.js
const cssPlugin = require('@airy/maleo-css-plugin');

module.exports = cssPlugin({
  enableISL: true, // Add this line
  cssPluginOptions: {
    cssLoader: {
      modules: true,
      localIdentName: '[path][name]__[local]--[hash:base64:5]',
    },
  },
});
```

After having done so, you need to add provided Higher Order Component to your custom `wrap`.

```jsx
// _wrap_.jsx
import React from 'react';
import Wrap from '@airy/maleo/wrap';

import PageWithStyles from '@airy/maleo-css-plugin/pageWithStyles'; // Add this line

@PageWithStyles // Add this line
export default class CustomWrap extends Wrap {}
```

And now you can use your CSS style on your component like this

```jsx
// Component.jsx
import React from 'react';
import withStyles from '@airy/maleo-css-plugin/withStyles'; // Add this line

import style from './style.css';

@withStyles(style) // Add this line
export default class Component extends React.Component {
  render() {
    // This component will have the .wrapper style we defined above
    return (
      <div className={style.wrapper}>
        <h1>Hello World</h1>
      </div>
    )
  }
}
```

`withStyles` is a Higher Order Component that receives your CSS style and will pass all your style to `PageWithStyles` and render your styling.

If you opt to enable ISL, you must add `PageWithStyles` to your custom `wrap` and use `withStyles` decorator as such to every of your component that uses your CSS style.

#### Extract CSS to CSS File
By enabling this feature, it extracts CSS into separate files. It creates a CSS file per JS file which contains CSS. It supports On-Demand-Loading of CSS or single file CSS, and SourceMaps.

Extract CSS feature has already optimized and minify your CSS file and only runs on production environment.

To enable this feature, you need to enable it on `maleo.config.js`
```javascript
// maleo.config.js
const cssPlugin = require('@airy/maleo-css-plugin');

module.exports = cssPlugin({
  extractCss: true,
  // you can also pass the option here such as:
  // extractCss: {
  // Here are the default option
  //  filename: '[name].css',
  //  chunkFilename: 'style-chunk-[name].css',
  //  singleCssFile: false, // if enabled, it will extract all the CSS files into single css file
  //  publicPath: undefined, // automatically follows webpack's publicPath if set undefined
  //  cache: true, // will enable long term caching by appending '[contenthash]' to filename and chunkFilename
  // },
  cssPluginOptions: {
    cssLoader: {
      modules: true,
      localIdentName: '[path][name]__[local]--[hash:base64:5]',
    },
  },
});
```

Having done so, you can use your CSS on your React Component like so
```jsx
// Component.jsx
import React from 'react';

import style from './style.css';

export default class Component extends React.Component {
  render() {
    // This component will have the .wrapper style we defined above
    return (
      <div className={style.wrapper}>
        <h1>Hello World</h1>
      </div>
    )
  }
}
```

