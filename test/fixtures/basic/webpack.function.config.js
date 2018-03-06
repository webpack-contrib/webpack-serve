'use strict';

const path = require('path');
const webpack = require('webpack');

// eslint-disable-next-line no-unused-vars
module.exports = function config(env, argv) {
  return {
    mode: 'development',
    context: __dirname,
    devtool: 'source-map',
    entry: ['./app.js'],
    output: {
      filename: './output.js',
      path: path.resolve(__dirname)
    },
    plugins: [
      new webpack.NamedModulesPlugin()
    ],
    serve: {}
  };
};
