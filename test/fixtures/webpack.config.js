'use strict';

const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: ['./test/fixtures/content/app.js'],
  output: {
    filename: 'output.js',
    path: path.join(__dirname, '/test/fixtures/content')
  },
  plugins: [
    new webpack.NamedModulesPlugin()
  ],
  serve: {}
};
