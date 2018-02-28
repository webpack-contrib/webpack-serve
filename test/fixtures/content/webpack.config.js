'use strict';

const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: ['./test/fixtures/content/content/app.js'],
  output: {
    filename: 'output.js',
    path: path.join(__dirname, '/test/fixtures/content/content')
  },
  plugins: [
    new webpack.NamedModulesPlugin()
  ],
  serve: {}
};
