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
  serve: {
    dev: { logLevel: 'silent', publicPath: '/' },
    hot: { logLevel: 'silent' },
    logLevel: 'silent',
  },
};
