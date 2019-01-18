// tslint:disable:no-console

import babelLoader from 'babel-loader';
import { preset } from '../babel/preset';

export default babelLoader.custom((babel) => {
  const presetConfig = babel.createConfigItem(preset, { type: 'preset' });

  const configs = new Set();

  return {
    config(config) {
      const options = { ...config.options };
      if (config.hasFilesystemConfig()) {
        for (const file of [config.babelrc, config.config]) {
          if (file && !configs.has(file)) {
            configs.add(file);
            console.log('[Zones-Babel-Loader] Using external babel configuration');
            console.log('[Zones-Babel-Loader] File: ', file);
          }
        }
      } else {
        options.presets = [...options.presets, presetConfig];
      }

      return options;
    },
  };
});
