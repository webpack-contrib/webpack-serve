'use strict';

const path = require('path');

const history = require('connect-history-api-fallback');
const proxy = require('http-proxy-middleware');
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
    app.use(convert(proxy('/api', { target: 'http://localhost:8081' })));
    app.use(convert(history()));
  }
};

// This add-on will route all incoming requests for
// "http://localhost:8080/api/*" to "http://localhost:8081/api/*" (note the port
// change), and all remaining requests, which would otherwise result in 404,
// will be rewritten to serve your "index.html", which is useful for single-page
// applications.
// 
// To remove the "/api" prefix when proxying the API requests, just add
// "pathRewrite: { '^/api': '' }" to proxy's options.
// 
// Proxy's docs: https://github.com/chimurai/http-proxy-middleware
// Fallback's docs: https://github.com/bripkens/connect-history-api-fallback
