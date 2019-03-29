import { Server } from '~/src/server/server';

let SelectedServer = Server;
// No need to load DevServer code for production server
if (__DEV__) {
  SelectedServer = require('~/src/server/dev-server').default;
}

const PORT = process.env.PORT || 3000;

const defaultServer = SelectedServer.init({
  port: PORT,
});

defaultServer.run(() => {
  // tslint:disable-next-line:no-console
  console.log('Server running on port :' + PORT);
});
