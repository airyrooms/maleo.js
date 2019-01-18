import path from 'path';

export const REACT_LOADABLE_MANIFEST: string = 'react-loadable-manifest.json';

export const USER_CUSTOM_CONFIG: string = 'zones.config.js';

export const SERVER_ENTRY_NAME: string = 'server.js';

export const CLIENT_ENTRY_NAME: string = 'client.js';

export const BUILD_DIR: string = '.zones';

export const RUNTIME_CHUNK_FILE: string = 'static/runtime/webpack.js';

export const SERVER_ASSETS_ROUTE: string = '/_assets/';

export const SERVER_INITIAL_DATA: string = '__ZONES_INITIAL_DATA__';

export const DIV_ZONES_ID: string = '_zones_';

export const ZONES_PROJECT_ROOT: string = path.join(__dirname, '..', '..', '..');

export const ZONES_PROJECT_ROOT_NODE_MODULES: string = path.join(
  ZONES_PROJECT_ROOT,
  'node_modules',
);

export const AUTODLL_PATH: string = './static/dll';
