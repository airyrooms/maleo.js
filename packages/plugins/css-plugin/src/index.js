const path = require('path');

module.exports = (customConfig = {}) => {
  return Object.assign({}, customConfig, {
    webpack(config, context, next) {
      config.module.rules.push({
        test: /\.css$/,
        use: [
          require.resolve('isomorphic-style-loader'),
          {
            loader: require.resolve('css-loader'),
          },
        ],
      });

      next(customConfig);
    },
  });
};
