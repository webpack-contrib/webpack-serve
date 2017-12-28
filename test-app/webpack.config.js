'use strict';

const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: {
    index: [
      // 'webpack-hot-middleware/client?reload=true&path=/__webpack_hmr&timeout=20000',
      path.resolve(__dirname, 'app.js')
    ]
  },
  mode: 'development',
  output: {
    filename: 'output.js'
  },
  plugins: [
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin()
  ]
};

module.exports.serve = {
  add: (app, middleware, options) => { // eslint-disable-line no-unused-vars
    app.use((ctx, next) => {
      ctx.set('X-Custom-Middleware', 'owns');
      return next();
    });

    // middleware.webpack();
    // middleware.content();
  },
  content: [__dirname],
  hmr: true
  // open: true
  // open: { app: 'Firefox', path: '/foo' }
};

module.exports.middleware = {
  dev: {
    headers: { 'X-Foo': 'Kachow' }
  }
};
