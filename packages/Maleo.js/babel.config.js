const { paths } = require('./tsconfig.json').compilerOptions;

const aliases = {};

Object.keys(paths).forEach((item) => {
  const key = item.replace('/*', '');
  const path = paths[item][0].replace(/src\/(.+)\/\*/, './lib/$1/');

  aliases[key] = path;
});

module.exports = (api) => {
  api.cache(true);

  const presets = [
    '@babel/preset-env',
    '@babel/preset-react',
    [
      '@babel/preset-typescript',
      {
        allExtensions: true,
        isTSX: true,
      },
    ],
  ];

  const plugins = [
    [
      '@babel/plugin-proposal-class-properties',
      {
        loose: true,
      },
    ],
    '@babel/plugin-syntax-dynamic-import',
    [
      '@babel/plugin-proposal-decorators',
      {
        legacy: true,
      },
    ],
    '@babel/plugin-proposal-object-rest-spread',
    [
      'module-resolver',
      {
        alias: aliases,
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
        root: ['.'],
      },
    ],
    'react-loadable/babel',
    [
      '@babel/plugin-transform-runtime',
      {
        corejs: 2,
      },
    ],
  ];

  return {
    plugins,
    presets,
  };
};
