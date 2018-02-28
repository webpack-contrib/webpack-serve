'use strict';

const assert = require('power-assert');
const sinon = require('sinon');
const strip = require('strip-ansi');
const weblog = require('webpack-log');
const { load, pause, serve, t, timeout } = require('../util');

const log = console;
const og = {
  info: log.info,
  warn: log.warn,
  error: log.error
};

function spy() {
  const noop = () => {};
  const sandbox = sinon.sandbox.create();

  log.info = noop;
  log.warn = noop;
  log.error = noop;

  sandbox.spy(log, 'info');
  sandbox.spy(log, 'warn');
  sandbox.spy(log, 'error');

  return sandbox;
}

function restore(sandbox) {
  log.info = og.info;
  log.warn = og.warn;
  log.error = og.error;
  sandbox.restore();
}

describe('webpack-serve Logging', () => {
  before(pause);
  beforeEach(function be(done) { // eslint-disable-line prefer-arrow-callback
    weblog.delLogger('webpack-serve');
    pause.call(this, done);
  });

  after(() => weblog.delLogger('webpack-serve'));

  t('should default logLevel to `info`', (done) => {
    const sandbox = spy();
    const config = load('./fixtures/basic/webpack.config.js', false);

    serve({ config }).then((server) => {
      server.compiler.plugin('done', () => {
        assert(log.info.callCount > 0);
        restore(sandbox);
        server.close(done);
      });
    });
  });

  t('should silence only webpack-serve', (done) => {
    const sandbox = spy();
    const config = load('./fixtures/basic/webpack.config.js', false);
    config.serve = { logLevel: 'silent' };

    serve({ config }).then((server) => {
      setTimeout(() => {
        const calls = log.info.getCalls();
        assert(log.info.callCount > 0);

        for (const call of calls) {
          const arg = strip(call.args[0]);
          assert(arg.indexOf('｢serve｣') === -1);
        }

        restore(sandbox);
        server.close(done);
      }, timeout * 2);
    });
  });

  t('should accept a logTime option', (done) => {
    const sandbox = spy();
    const config = load('./fixtures/basic/webpack.config.js', false);
    config.serve = { logTime: true };

    serve({ config }).then((server) => {
      server.on('listening', () => {
        const calls = log.info.getCalls();

        assert(log.info.callCount > 0);

        for (const call of calls) {
          const arg = strip(call.args[0]);
          if (arg.indexOf('｢serve｣') > 0) {
            assert(/^\[[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2}\]/.test(arg));
          }
        }

        restore(sandbox);
        server.close(done);
      });
    });
  });
});
