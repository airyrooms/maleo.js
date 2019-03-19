import { init } from '~/src/client/client';

if (__DEV__) {
  const { clientHMR } = require('~/src/client/hmr/client-hmr');
  clientHMR({})(init);
} else {
  init();
}
