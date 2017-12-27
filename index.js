'use strict';

if (!module.parent) {
  // eslint-disable-next-line global-require
  require('v8-compile-cache');
}

const path = require('path');
const webpack = require('webpack');
const server = require('./lib/server');

// eslint-disable-next-line import/no-dynamic-require
const config = require(path.join(__dirname, 'test-app/webpack.config.js'));
const options = config.serve;

delete config.serve;

const compiler = webpack(config);

server.start(Object.assign(options, { compiler }));
