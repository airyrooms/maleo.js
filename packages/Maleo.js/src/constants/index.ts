import path from 'path';

export const REACT_LOADABLE_MANIFEST = 'react-loadable-manifest.json';

export const USER_CUSTOM_CONFIG = 'maleo.config.js';

export const SERVER_ENTRY_NAME = 'server.js';

export const CLIENT_ENTRY_NAME = 'client.js';

export const ROUTES_ENTRY_NAME = 'routes.json';
export const DOCUMENT_ENTRY_NAME = '_document.jsx';
export const WRAP_ENTRY_NAME = '_wrap.jsx';
export const APP_ENTRY_NAME = '_app.jsx';

export const BUILD_DIR = '.maleo';

export const RUNTIME_CHUNK_FILE = 'static/runtime/webpack.js';

export const SERVER_ASSETS_ROUTE = '/_assets/';

export const SERVER_INITIAL_DATA = '__MALEO_INITIAL_DATA__';

export const DIV_MALEO_ID = '_maleo_';

export const MALEO_PROJECT_ROOT = path.join(__dirname, '..', '..', '..');

export const MALEO_PROJECT_ROOT_NODE_MODULES = path.join(MALEO_PROJECT_ROOT, 'node_modules');

export const PROJECT_ROOT_NODE_MODULES = path.join(process.cwd(), 'node_modules');

export const AUTODLL_PATH = './static/dll';

export const CUSTOM_DOCUMENT_PATH = path.join(process.cwd(), 'document.js');

export const CUSTOM_WRAP_PATH = path.join(process.cwd(), 'wrap.js');

export const REGISTERS = {
  WINDOW_VAR_NAME: '__REGISTERS__',
  ROUTES: '__MALEO__ROUTES__',
  WRAP: '__MALEO__WRAP__',
  APP: '__MALE_APP__',
};

export const STATIC_ENTRIES = ['document', 'wrap', 'app', 'routes'];

export const STATIC_BUILD_DIR = path.join(BUILD_DIR, 'static');

export const SERVER_BUILD_DIR = 'server';

export const CLIENT_BUILD_DIR = 'client';

export const STATS_FILENAME = 'stats.json';

export const MATCHED_ROUTES_KEY = 'matched';
