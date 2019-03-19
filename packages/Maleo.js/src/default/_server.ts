import { Server } from '~/src/server/server';

const PORT = process.env.PORT || 3000;

const defaultServer = Server.init({
  port: PORT,
});

defaultServer.run(() => {
  // tslint:disable-next-line:no-console
  console.log('Server running on port :' + PORT);
});
