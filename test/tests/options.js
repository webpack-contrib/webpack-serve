'use strict';

const path = require('path');
const assert = require('power-assert');
const fetch = require('node-fetch');
const mock = require('mock-require');
const webpack = require('webpack'); // eslint-disable-line import/order

let hook = () => {}; // eslint-disable-line prefer-const
mock('opn', (...args) => {
  hook(...args);
});

const { load, serve } = require('../util');

describe('webpack-serve Options', () => {
  it('should accept an add option', (done) => {
    const config = load('./fixtures/htm/webpack.config.js');
    config.serve.add = (app, middleware) => {
      middleware.webpack();

      middleware.content({
        index: 'index.htm'
      });
    };

    serve({ config }).then(({ close }) => {
      setTimeout(() => {
        fetch('http://localhost:8080')
          .then((res) => {
            assert(res.ok);
            close(done);
          });
      }, 1e3);
    });
  });

  it('should accept a compiler option', (done) => {
    const config = load('./fixtures/basic/webpack.config.js');
    const options = Object.assign({}, config.serve);
    delete config.serve;

    const compiler = webpack(config);
    options.compiler = compiler;

    serve(options).then(({ close }) => {
      setTimeout(() => {
        fetch('http://localhost:8080')
          .then((res) => {
            assert(res.ok);
            close(done);
          });
      }, 1e3);
    });
  });

  it('should accept a content option', (done) => {
    const config = load('./fixtures/webpack.config.js');
    config.serve.content = path.resolve(__dirname, '../fixtures/content');

    serve({ config }).then(({ close }) => {
      setTimeout(() => {
        fetch('http://localhost:8080')
          .then((res) => {
            assert(res.ok);
            close(done);
          });
      }, 1e3);
    });
  });

  it('should accept a dev option');

  it('should accept a host option', (done) => {
    const config = load('./fixtures/basic/webpack.config.js');
    config.serve.host = '0.0.0.0';

    serve({ config }).then(({ close }) => {
      setTimeout(() => {
        fetch('http://0.0.0.0:8080')
          .then((res) => {
            assert(res.ok);
            close(done);
          });
      }, 1e3);
    });
  });

  // need to get devcert documentation going and then write tests
  // for the http2 test: https://nodejs.org/api/http2.html#http2_client_side_example
  it('should accept a http2 option');
  it('should accept a https option');

  // will need to spy on the console
  it('should accept a logLevel option');
  it('should accept a logTime option');

  it('should accept an open:Boolean option', (done) => {
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

  it('should accept an open:Object option', (done) => {
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

  it('should accept a port option', (done) => {
    const config = load('./fixtures/basic/webpack.config.js');
    config.serve.port = '1337';

    serve({ config }).then(({ close }) => {
      setTimeout(() => {
        fetch('http://localhost:1337')
          .then((res) => {
            assert(res.ok);
            close(done);
          });
      }, 1e3);
    });
  });

  it('should not accept a mismatched hot.host option', (done) => {
    const config = load('./fixtures/basic/webpack.config.js');
    config.serve.host = '0.0.0.0';
    config.serve.hot = { host: 'localhost' };

    serve({ config }).catch((err) => {
      assert(err);
      done();
    });
  });
});
