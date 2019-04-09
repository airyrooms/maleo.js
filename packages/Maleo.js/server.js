if (process.env.NODE_ENV === 'development') {
  module.exports = require('./lib/server/dev-server.js');
} else {
  module.exports = require('./lib/server/server');
}
