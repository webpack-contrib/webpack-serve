const path = require('path');

const assert = require('power-assert');
const clip = require('clipboardy');

const WebpackServeError = require('../../lib/WebpackServeError');
const { load, serve, t } = require('../util');

const logLevel = 'info';

describe('webpack-serve API', () => {
  it('should exist', () => assert(serve));

  it('should export', () => {
    assert(typeof serve === 'function');
  });

  t('should serve', (done) => {
    const config = load('./fixtures/basic/webpack.config.js');
    serve({ config }).then((server) => {
      assert(server);
      assert(typeof server.close === 'function');
      assert(typeof server.on === 'function');

      setTimeout(() => server.close(done), 1000);
    });
  });

  t('should throw', (done) => {
    const config = { bad: 'batman' };
    serve({ config }).catch((error) => {
      assert(error instanceof WebpackServeError);
      done();
    });
  });

  t('should serve with <String> entry', (done) => {
    const config = load('./fixtures/basic/webpack.string-entry.config.js');
    serve({ config }).then((server) => {
      assert(server);

      setTimeout(() => server.close(done), 1000);
    });
  });

  t('should serve with MultiCompiler', (done) => {
    const config = load('./fixtures/multi/webpack.config.js');

    serve({ config }).then((server) => {
      assert(server);

      setTimeout(() => server.close(done), 1000);
    });
  });

  t('should serve with <Object> entry', (done) => {
    const config = load('./fixtures/basic/webpack.object.config.js');
    serve({ config }).then((server) => {
      assert(server);

      setTimeout(() => server.close(done), 1000);
    });
  });

  t('should serve with <Function> config', (done) => {
    const config = './test/fixtures/basic/webpack.function.config.js';
    serve({
      config,
      logLevel,
      dev: { logLevel },
      hot: { logLevel },
    }).then((server) => {
      assert(server);

      setTimeout(() => server.close(done), 1000);
    });
  });

  t('should serve with webpack v4 defaults', (done) => {
    const content = path.join(__dirname, '../fixtures/webpack-4-defaults');

    serve({
      content,
      logLevel,
      dev: { logLevel, publicPath: '/' },
      hot: { logLevel },
    }).then((server) => {
      assert(server);

      setTimeout(() => server.close(done), 1000);
    });
  });

  t('should serve with partial webpack 4 defaults', (done) => {
    const config = load(
      './fixtures/webpack-4-defaults/webpack.no-entry.config.js'
    );
    serve({ config }).then((server) => {
      assert(server);

      setTimeout(() => server.close(done), 1000);
    });
  });

  t('should have copied the uri to the clipboard', () => {
    assert.equal(clip.readSync(), 'http://localhost:8080');
  });
});
