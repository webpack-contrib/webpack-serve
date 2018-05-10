const path = require('path');

const proxy = require('http-proxy-middleware');
const convert = require('koa-connect');
const Router = require('koa-router');

const router = new Router();

const proxyOptions = {
  target: 'http://api.github.com',
  changeOrigin: true,
  // ... see: https://github.com/chimurai/http-proxy-middleware#options
};

router.get('*', convert(proxy(proxyOptions)));

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
  add: (app, middleware, options) => {
    // since we're manipulating the order of middleware added, we need to handle
    // adding these two internal middleware functions.
    middleware.webpack();
    middleware.content();

    // router *must* be the last middleware added
    app.use(router.routes());
  },
};
