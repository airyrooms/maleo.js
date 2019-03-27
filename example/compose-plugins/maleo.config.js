const cssPlugin = require('@airy/maleo-css-plugin')
const tsPlugin = require('@airy/maleo-typescript-plugin')
const compose = require('@airy/maleo-compose-plugin')

module.exports = compose([
  [tsPlugin],
  [cssPlugin, {
    extractCss: {
      singleCssFile: true,
    },
    cssLoader: {
      modules: true,
      localIdentName: '[path][name]__[local]--[hash:base64:5]'
    }
  }]
])
