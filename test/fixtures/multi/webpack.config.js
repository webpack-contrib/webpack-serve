'use strict';

module.exports = [{
  context: __dirname,
  entry: './client.js',
  output: {
    filename: 'client.js',
    path: '/client',
    publicPath: '/static/'
  }
}, {
  context: __dirname,
  entry: './server.js',
  output: {
    filename: 'server.js',
    path: '/server'
  }
}];
