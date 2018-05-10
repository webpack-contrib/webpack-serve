const path = require('path');

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
    // we need to manually call the webpack middleware since we're manipulating
    // the static content middleware afterward. This preserves the typically
    // correct ordering.
    middleware.webpack();

    // pass desired options here. eg.
    middleware.content({
      index: 'index.aspx',
      // see: https://github.com/koajs/static#options
    });
  },
};
