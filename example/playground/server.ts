import { Server } from '@airy/zones/lib/server/Server';
import path from 'path';

import { MyDocument } from './_document';
import { routes } from './routes';
import { Wrap } from './_wrap';

const PORT = process.env.PORT || 8080;

const zonesServer = Server.init({
  port: PORT,
  assetDir: path.resolve('.', '.zones', 'client'),
  distDir: path.resolve('.', 'dist'),

  routes,

  _document: MyDocument,
  _wrap: Wrap,
});

zonesServer.run(() => {
  console.log('Server running on port :' + PORT);
});
