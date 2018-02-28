'use strict';

const path = require('path');
const assert = require('power-assert');
const fetch = require('node-fetch');
const mock = require('mock-require');
const webpack = require('webpack'); // eslint-disable-line import/order
const util = require('../util');

const nodeVersion = parseInt(process.version.substring(1), 10);

const { load, pause, serve, t } = util;
let hook;

mock('opn', (...args) => {
  hook(...args);
});

describe('webpack-serve Options', () => {
  before(pause);
  beforeEach(pause);
  afterEach(() => { hook = null; });

  t('should accept an add option', (done) => {
    const config = load('./fixtures/htm/webpack.config.js');
    config.serve.add = (app, middleware) => {
      middleware.webpack();

      middleware.content({
        index: 'index.htm'
      });
    };

    serve({ config }).then((server) => {
      server.on('listening', () => {
        fetch('http://localhost:8080')
          .then((res) => {
            assert(res.ok);
            server.close(done);
          });
      });
    });
  });

  t('should accept a compiler option', (done) => {
    const config = load('./fixtures/basic/webpack.config.js');
    const options = Object.assign({}, config.serve);
    delete config.serve;

    const compiler = webpack(config);
    options.compiler = compiler;

    serve(options).then((server) => {
      server.on('listening', () => {
        fetch('http://localhost:8080')
          .then((res) => {
            assert(res.ok);
            server.close(done);
          });
      });
    });
  });

  t('should accept a content option', (done) => {
    const config = load('./fixtures/basic/webpack.config.js');
    config.serve.content = path.resolve(__dirname, '../fixtures/content');

    serve({ config }).then((server) => {
      server.on('listening', () => {
        fetch('http://localhost:8080')
          .then((res) => {
            assert(res.ok);
            server.close(done);
          });
      });
    });
  });

  t('should accept a dev option', (done) => {
    const config = load('./fixtures/basic/webpack.config.js');
    config.serve = {
      dev: {
        headers: { 'X-Foo': 'Kachow' },
        logLevel: 'silent',
        publicPath: '/'
      }
    };

    serve({ config }).then((server) => {
      server.on('listening', () => {
        fetch('http://localhost:8080/output.js')
          .then((res) => {
            assert(res.ok);
            assert.equal(res.headers.get('x-foo'), 'Kachow');
            server.close(done);
          });
      });
    });
  });

  t('should accept a host option', (done) => {
    const config = load('./fixtures/basic/webpack.config.js');
    config.serve.host = '0.0.0.0';

    serve({ config }).then((server) => {
      server.on('listening', () => {
        fetch('http://0.0.0.0:8080')
          .then((res) => {
            assert(res.ok);
            server.close(done);
          });
      });
    });
  });

  if (nodeVersion < 9) {
    t('should reject the http2 for Node < 9', (done) => {
      const config = load('./fixtures/basic/webpack.config.js');
      config.serve.http2 = true;

      serve({ config }).catch((err) => {
        assert(err);
        done();
      });
    });
  }

  // need to get devcert documentation going and then write tests
  // for the http2 test: https://nodejs.org/api/http2.html#http2_client_side_example
  t('should accept a http2 option');
  t('should accept a https option');

  // logLevel and logTime option tests can be found in ./log.js

  t('should accept an open:Boolean option', (done) => {
    const config = load('./fixtures/basic/webpack.config.js');
    config.serve.open = true;

    serve({ config }).then(({ close }) => {
      hook = (...args) => {
        assert.equal(args[0], 'http://localhost:8080/');
        assert.equal(args[1], true);
        close(done);
      };
    });
  });

  t('should accept an open:Object option', (done) => {
    const config = load('./fixtures/basic/webpack.config.js');
    const opts = { app: 'Firefox', path: '/foo' };
    config.serve.open = opts;

    serve({ config }).then(({ close }) => {
      hook = (...args) => {
        assert.equal(args[0], 'http://localhost:8080/foo');
        assert.equal(args[1], opts);
        close(done);
      };
    });
  });

  t('should accept a port option', (done) => {
    const config = load('./fixtures/basic/webpack.config.js');
    config.serve.port = '1337';

    serve({ config }).then((server) => {
      server.on('listening', () => {
        fetch('http://localhost:1337')
          .then((res) => {
            assert(res.ok);
            server.close(done);
          });
      });
    });
  });

  t('should not accept a mismatched hot.host option', (done) => {
    const config = load('./fixtures/basic/webpack.config.js');
    config.serve.host = '0.0.0.0';
    config.serve.hot = { host: 'localhost' };

    serve({ config }).catch((err) => {
      assert(err);
      done();
    });
  });
});
