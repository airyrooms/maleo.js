import path from 'path';

export const REACT_LOADABLE_MANIFEST: string = 'react-loadable-manifest.json';

export const USER_CUSTOM_CONFIG: string = 'maleo.config.js';

export const SERVER_ENTRY_NAME: string = 'server.js';

export const CLIENT_ENTRY_NAME: string = 'client.js';

export const BUILD_DIR: string = '.maleo';

export const RUNTIME_CHUNK_FILE: string = 'static/runtime/webpack.js';

export const SERVER_ASSETS_ROUTE: string = '/_assets/';

export const SERVER_INITIAL_DATA: string = '__MALEO_INITIAL_DATA__';

export const DIV_MALEO_ID: string = '_maleo_';

export const MALEO_PROJECT_ROOT: string = path.join(__dirname, '..', '..', '..');

export const MALEO_PROJECT_ROOT_NODE_MODULES: string = path.join(
  MALEO_PROJECT_ROOT,
  'node_modules',
);

export const AUTODLL_PATH: string = './static/dll';
