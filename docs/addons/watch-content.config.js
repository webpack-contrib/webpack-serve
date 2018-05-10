const path = require('path');

const chokidar = require('chokidar');
const stringify = require('json-stringify-safe');
const WebSocket = require('ws');

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
  hot: {
    host: 'localhost',
    port: 8090,
  },
  on: {
    listening(server) {
      const socket = new WebSocket('ws://localhost:8090');
      const watchPath = __dirname;
      const options = {};
      const watcher = chokidar.watch(watchPath, options);

      watcher.on('change', () => {
        const data = {
          type: 'broadcast',
          data: {
            type: 'window-reload',
            data: {},
          },
        };

        socket.send(stringify(data));
      });

      server.on('close', () => {
        watcher.close();
      });
    },
  },
};
