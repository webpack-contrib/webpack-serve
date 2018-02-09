'use strict';

const serve = require('../');

const timeout = process.env.TRAVIS_OS_NAME ? 2e3 : 1e3;

module.exports = {

  load(path, silent = true) {
    const config = Object.assign({}, require(path));

    if (silent) {
      config.serve = Object.assign({
        dev: { logLevel: 'silent', publicPath: '/' },
        hot: { logLevel: 'silent' },
        logLevel: 'silent'
      }, config.serve);
    }

    return config;
  },

  // this whole maddness is required on travis because it's THAT slow
  pause(done) {
    if (process.env.TRAVIS_OS_NAME) {
      this.timeout(3e2);
      setTimeout(done, 2e2);
    } else {
      done();
    }
  },

  serve(...args) {
    return serve(...args).then((server) => {
      server.on('compiler-error', (err) => {
        throw err[0];
      });

      return server;
    });
  },

  t: (...args) => it(...args).timeout(5e3),

  timeout
};
