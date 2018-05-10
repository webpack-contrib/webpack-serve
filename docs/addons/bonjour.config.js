const path = require('path');

function broadcast(port) {
  const bonjour = require('bonjour')(); // eslint-disable-line
  bonjour.publish({
    name: `Some Bitchin' App`,
    port,
    type: 'http',
    subtypes: ['webpack'],
  });
  process.on('exit', () => {
    bonjour.unpublishAll(() => {
      bonjour.destroy();
    });
  });
}

module.exports = {
  entry: {
    index: [path.resolve(__dirname, 'app.js')],
  },
  mode: 'development',
  output: {
    filename: 'output.js',
  },
};

module.exports.serve = {
  content: [__dirname],
  on: {
    listen(server) {
      broadcast(server.address().port);
    },
  },
};
