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
    // this example shows how to properly add middleware _after_ the built-in
    // webpack and content middleware. since middleware must be added at the
    // end of the middleware stack, we have to call the default middlewares
    // ourselves
    middleware.webpack().then(() => {
      middleware.content({
        index: 'index.htm',
      });

      // this example assumes router must be added last
      app.use(router.routes());
    });
  },
};
