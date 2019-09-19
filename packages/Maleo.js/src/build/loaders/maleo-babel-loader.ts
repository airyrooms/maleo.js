// tslint:disable:no-console

import babelLoader from 'babel-loader';
import { preset } from '../babel/preset';

export default babelLoader.custom((babel) => {
  let once = 0;
  return {
    customOptions({ isServer, esModules, ...opts }) {
      const custom = {
        isServer,
        esModules,
      };

      const loader = {
        cacheCompression: false,
        cacheDirectory: true,
        ...opts,
      };

      return { loader, custom };
    },
    config(config, { customOptions: { isServer, esModules } }) {
      const pluginOptions = {
        isServer,
        esModules,
      };

      const options = { ...config.options };

      if (config.hasFilesystemConfig()) {
        for (const file of [config.babelrc, config.config]) {
          if (file) {
            if (!++once) {
              console.log('[Maleo-Babel-Loader] Using external babel configuration');
              console.log('[Maleo-Babel-Loader] File: ', file);
            }

            const { value: userPresets, options: userOptions } = options.presets[0];

            const presetConfig = babel.createConfigItem(
              [userPresets, { ...pluginOptions, ...userOptions }],
              {
                type: 'preset',
              },
            );

            options.presets = [presetConfig];
          }
        }
      } else {
        const presetConfig = babel.createConfigItem([preset, pluginOptions], {
          type: 'preset',
        });

        options.presets = [...options.presets, presetConfig];
      }

      return options;
    },
  };
});
