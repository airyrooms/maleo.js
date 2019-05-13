import { Server } from '~/src/server/server';

let SelectedServer = Server;
// No need to load DevServer code for production server
if (process.env.NODE_ENV === 'development') {
  SelectedServer = require('~/src/server/dev-server').default;
}

const PORT = process.env.PORT || 3000;

const handler = () => {
  // tslint:disable-next-line:no-console
  console.log('Server running on port :' + PORT);
};

const defaultServer = SelectedServer.init({
  port: PORT,
  runHandler: handler,
});

defaultServer.run();
