'use strict';

module.exports = {
  load(path) {
    const config = require(path);
    config.serve = Object.assign({
      dev: { logLevel: 'silent', publicPath: '/' },
      hot: { logLevel: 'silent' },
      logLevel: 'silent'
    }, config.serve);

    return config;
  }
};
