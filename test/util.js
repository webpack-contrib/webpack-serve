'use strict';

const serve = require('../');

module.exports = {
  load(path, silent = true) {
    const config = require(path);

    if (silent) {
      config.serve = Object.assign({
        dev: { logLevel: 'silent', publicPath: '/' },
        hot: { logLevel: 'silent' },
        logLevel: 'silent'
      }, config.serve);
    }

    return config;
  },

  serve(...args) {
    return serve(...args).then((server) => {
      server.on('compiler-error', (err) => {
        throw err[0];
      });

      return server;
    });
  }
};
