import path from 'path';

export const REACT_LOADABLE_MANIFEST: string = 'react-loadable-manifest.json';

export const USER_CUSTOM_CONFIG: string = 'maleo.config.js';

export const SERVER_ENTRY_NAME: string = 'server.js';

export const CLIENT_ENTRY_NAME: string = 'client.js';

export const ROUTES_ENTRY_NAME: string = 'routes.json';
export const DOCUMENT_ENTRY_NAME: string = '_document.jsx';
export const WRAP_ENTRY_NAME: string = '_wrap.jsx';
export const APP_ENTRY_NAME: string = '_app.jsx';

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

export const PROJECT_ROOT_NODE_MODULES: string = path.join(process.cwd(), 'node_modules');

export const AUTODLL_PATH: string = './static/dll';

export const CUSTOM_DOCUMENT_PATH: string = path.join(process.cwd(), 'document.js');

export const CUSTOM_WRAP_PATH: string = path.join(process.cwd(), 'wrap.js');

export const REGISTERS = {
  WINDOW_VAR_NAME: '__REGISTERS__',
  ROUTES: '__MALEO__ROUTES__',
  WRAP: '__MALEO__WRAP__',
  APP: '__MALE_APP__',
};

export const STATIC_ENTRIES = ['document', 'wrap', 'app', 'routes'];
