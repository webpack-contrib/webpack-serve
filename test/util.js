'use strict';

const serve = require('../');

const timeout = process.env.CIRCLECI ? 2e3 : 1e3;

module.exports = {

  load(path, silent = true) {
    const raw = require(path) || {};
    const config = Array.isArray(raw) ? raw.slice(0) : Object.assign({}, raw);

    if (silent) {
      const opts = Object.assign({
        dev: { logLevel: 'silent', publicPath: '/' },
        hot: { logLevel: 'silent' },
        logLevel: 'silent'
      });

      if (Array.isArray(config)) {
        config[0].serve = Object.assign(opts, config[0].serve);
      } else {
        config.serve = Object.assign(opts, config.serve);
      }
    }

    return config;
  },

  pause(done) {
    if (process.env.CIRCLECI) {
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

  t: (...args) => it(...args).timeout(10e3),

  timeout
};
