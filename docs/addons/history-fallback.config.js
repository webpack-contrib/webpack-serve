'use strict';

const path = require('path');
const history = require('connect-history-api-fallback');
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
    const historyOptions = {
      // ... see: https://github.com/bripkens/connect-history-api-fallback#options
    };

    app.use(convert(history(historyOptions)));
  }
};
