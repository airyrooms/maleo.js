import { init } from '~/src/client/client';

if (process.env.NODE_ENV === 'development') {
  const { clientHMR } = require('~/src/client/hmr/client-hmr');
  clientHMR({})(init);
} else {
  init();
}
