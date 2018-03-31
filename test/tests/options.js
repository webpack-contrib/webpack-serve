'use strict';

const path = require('path');
const assert = require('power-assert');
const clip = require('clipboardy');
const fetch = require('node-fetch');
const mock = require('mock-require');
const webpack = require('webpack'); // eslint-disable-line import/order
const WebSocket = require('ws');
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

  t('should accept a clipboard option', (done) => {
    const config = load('./fixtures/basic/webpack.config.js');
    config.serve.clipboard = false;
    clip.writeSync('foo');

    serve({ config }).then((server) => {
      server.on('listening', () => {
        assert.equal(clip.readSync(), 'foo');
        server.close(done);
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

  t('should not accept a mismatched hot.host option', (done) => {
    const config = load('./fixtures/basic/webpack.config.js');
    config.serve.host = '0.0.0.0';
    config.serve.hot = { host: 'localhost' };

    serve({ config }).catch((err) => {
      assert(err);
      done();
    });
  });

  t('should not accept a mismatched hot.host.server option', (done) => {
    const config = load('./fixtures/basic/webpack.config.js');
    config.serve.host = '0.0.0.0';
    config.serve.hot = {
      host: {
        server: '10.1.1.1',
        client: 'localhost'
      }
    };

    serve({ config }).catch((err) => {
      assert(err);
      done();
    });
  });

  t('should accept a matching hot.host option', (done) => {
    const config = load('./fixtures/basic/webpack.config.js');
    config.serve.host = '0.0.0.0';
    config.serve.hot = { host: '0.0.0.0' };

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

  t('should accept a matching hot.host.server option', (done) => {
    const config = load('./fixtures/basic/webpack.config.js');
    config.serve.host = '0.0.0.0';
    config.serve.hot = {
      host: {
        server: '0.0.0.0',
        client: 'localhost'
      }
    };

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
    clip.writeSync('foo');

    serve({ config }).then(({ close }) => {
      hook = (...args) => {
        // the open option should disable the clipboard feature
        assert.equal(clip.readSync(), 'foo');
        assert.equal(args[0], 'http://localhost:8080/');
        assert.equal(Object.keys(args[1]), 0);
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
        assert.equal(args[1], 'Firefox');
        close(done);
      };
    });
  });

  // NOTE: we have to test this here as we have no means to hook opn via the cli
  // tests
  t('should accept --open-* flags', (done) => {
    const config = load('./fixtures/basic/webpack.config.js');
    const flags = {
      openApp: '["Firefox","--some-arg"]',
      openPath: '/some-path'
    };

    serve({ config, flags }).then(({ close }) => {
      hook = (...args) => {
        assert.equal(args[0], 'http://localhost:8080/some-path');
        assert.deepEqual(args[1], JSON.parse(flags.openApp));
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

  t('should accept a hot.hot option of `false`', (done) => {
    const config = load('./fixtures/basic/webpack.config.js');
    config.serve.hot = false;

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

  t('should accept a hot option of `true`', (done) => {
    const config = load('./fixtures/basic/webpack.config.js');
    config.serve.hot = true;

    serve({ config }).then((server) => {
      server.on('listening', () => {
        // options.hot should be mutated from the default setting as an object
        assert(typeof server.options.hot === 'object');
        setTimeout(() => server.close(done), 1000);
      });
    });
  });

  t('should accept a hot option of `false` and disable webpack-hot-client', (done) => {
    const config = load('./fixtures/basic/webpack.config.js');
    config.serve.hot = false;

    serve({ config }).then((server) => {
      const socket = new WebSocket('ws://localhost:8081');

      socket.on('error', (error) => {
        // this asserts that the WebSocketServer is not running, a sure sign
        // that webpack-hot-client has been disabled.
        assert(/ECONNREFUSED/.test(error.message));
        setTimeout(() => server.close(done), 1000);
      });
    });
  });

  t('should merge child options', (done) => {
    const config = load('./fixtures/basic/webpack.options-merge.config.js', false);
    serve({ config }).then((server) => {
      assert(server.options);
      assert(server.options.dev.logLevel === 'error');
      assert(server.options.dev.publicPath === '/');

      setTimeout(() => server.close(done), 1000);
    });
  });
});
