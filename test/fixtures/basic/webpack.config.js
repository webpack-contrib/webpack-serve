const path = require('path');

const { NamedModulesPlugin } = require('webpack');

module.exports = {
  context: __dirname,
  devtool: 'source-map',
  entry: ['./app.js'],
  output: {
    filename: './output.js',
    path: path.resolve(__dirname),
  },
  plugins: [new NamedModulesPlugin()],
  serve: {},
};
