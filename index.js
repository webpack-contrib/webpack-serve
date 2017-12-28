'use strict';

if (!module.parent) {
  // eslint-disable-next-line global-require
  require('v8-compile-cache');
}

const path = require('path');
const weblog = require('webpack-log');
const webpack = require('webpack');
const server = require('./lib/server');
const { addEntry } = require('./lib/util');

const log = weblog({ name: 'serve', id: 'webpack-serve' });

// eslint-disable-next-line import/no-dynamic-require
const config = require(path.join(__dirname, 'test-app/webpack.config.js'));
const options = config.serve;
const defaults = {
  dev: { publicPath: '/' },
  hot: {
    log: log.info,
    path: '/__webpack_hmr',
    heartbeat: 10 * 1000,
    reload: true
  }
};

options.dev = Object.assign(defaults.dev, config.middleware.dev);
options.hot = Object.assign(defaults.hot, config.middleware.hot);

delete config.serve;
delete config.middleware;

if (options.hmr) {
  addEntry(config);
}

const compiler = webpack(config);

server.start(Object.assign(options, { compiler }));
