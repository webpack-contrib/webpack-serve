const path = require('path');

const webpack = require('webpack');

module.exports = [
  {
    name: 'compiler1',
    context: __dirname,
    devtool: 'source-map',
    entry: ['./app.js'],
    output: {
      filename: './bundle1.js',
      path: path.resolve(__dirname),
    },
    plugins: [new webpack.NamedModulesPlugin()],
    serve: {},
  },
  {
    name: 'compiler2',
    context: __dirname,
    devtool: 'source-map',
    entry: ['./page.js'],
    output: {
      filename: './bundle2.js',
      path: path.resolve(__dirname),
    },
    plugins: [new webpack.NamedModulesPlugin()],
  },
];
