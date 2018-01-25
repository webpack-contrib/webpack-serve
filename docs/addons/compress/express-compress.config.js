'use strict';

const path = require('path');
const compress = require('compression');
const convert = require('koa-connect');

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
  add: (app, middleware, options) => {
    app.use(convert(compress()));
  }
};
