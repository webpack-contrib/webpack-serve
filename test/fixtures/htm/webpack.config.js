const path = require('path');

const webpack = require('webpack');

module.exports = {
  context: __dirname,
  devtool: 'source-map',
  entry: ['./app.js'],
  output: {
    filename: './output.js',
    path: path.resolve(__dirname),
  },
  plugins: [new webpack.NamedModulesPlugin()],
  serve: {},
};

// module.exports.serve = {
//   add: (app, middleware, options) => { // eslint-disable-line no-unused-vars
//     app.use((ctx, next) => {
//       ctx.set('X-Custom-Middleware', 'owns');
//       return next();
//     });
//
//     // middleware.webpack();
//     // middleware.content();
//   },
//   content: [__dirname],
//   dev: {
//     headers: { 'X-Foo': 'Kachow' }
//   },
//   hot: {
//     logLevel: 'info',
//     logTime: true
//   }
//   // open: true
//   // open: { app: 'Firefox', path: '/foo' }
// };
