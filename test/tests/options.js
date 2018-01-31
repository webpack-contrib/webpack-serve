'use strict';

const path = require('path');
const assert = require('power-assert');
const fetch = require('node-fetch');
const webpack = require('webpack');
const { load, serve } = require('../util');

describe('webpack-serve Options', () => {
  it('should accept an add option');

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

  // will need to hook `opn` to prevent it from actually opening the browser
  it('should accept an open option');

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
