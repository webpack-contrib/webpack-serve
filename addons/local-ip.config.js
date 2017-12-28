'use strict';

const path = require('path');
const internalIp = require('internal-ip');

module.exports = {
  entry: {
    index: [path.resolve(__dirname, 'app.js')]
  },
  mode: 'development',
  output: {
    filename: 'output.js'
  }
};

module.exports.serve = {
  content: [__dirname],
  host: internalIp.v4.sync()
};
