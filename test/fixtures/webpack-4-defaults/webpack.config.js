const webpack = require('webpack');

module.exports = {
  mode: 'development',
  context: __dirname,
  plugins: [new webpack.NamedModulesPlugin()],
  serve: {},
};
