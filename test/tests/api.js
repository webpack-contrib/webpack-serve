'use strict';

const path = require('path');
const assert = require('power-assert');
const clip = require('clipboardy');
const webpackPackage = require('webpack/package.json');
const { load, serve, t } = require('../util');

const webpackVersion = parseInt(webpackPackage.version, 10);

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

  if (webpackVersion > 3) {
    t('should serve with webpack v4 defaults', (done) => {
      const content = path.join(__dirname, '../fixtures/webpack-4-defaults');

      serve({
        content,
        dev: { logLevel: 'silent', publicPath: '/' },
        hot: { logLevel: 'silent' },
        logLevel: 'silent'
      }).then((server) => {
        assert(server);

        setTimeout(() => server.close(done), 1000);
      });
    });
  }

  t('should have copied the uri to the clipboard', () => {
    assert.equal(clip.readSync(), 'http://localhost:8080');
  });
});
