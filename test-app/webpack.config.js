'use strict';

const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: {
    index: [
      'webpack-hot-middleware/client?reload=true&path=/__webpack_hmr&timeout=20000',
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
  content: [__dirname]
};
