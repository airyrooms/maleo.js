module.exports = {
  presets: [
    [
      require('@airy/maleo/babel'),
      {
        client: {
          'preset-env': {
            targets: '>0.25%',
          },
        },
      },
    ],
  ],
};
