'use strict';

const assert = require('power-assert');
const clip = require('clipboardy');
const { load, serve } = require('../util');

describe('webpack-serve API', () => {
  it('should exist', () => assert(serve));

  it('should export', () => {
    assert(typeof serve === 'function');
  });

  it('should serve', (done) => {
    const config = load('./fixtures/basic/webpack.config.js');
    serve({ config }).then((server) => {
      assert(server);
      assert(typeof server.close === 'function');
      assert(typeof server.on === 'function');

      setTimeout(() => server.close(done), 1000);
    });
  });

  it('should serve with <String> entry', (done) => {
    const config = load('./fixtures/basic/webpack.string-entry.config.js');
    serve({ config }).then((server) => {
      assert(server);

      setTimeout(() => server.close(done), 1000);
    });
  });

  it('should serve with MultiCompiler', (done) => {
    const config = load('./fixtures/multi/webpack.config.js');

    serve({ config }).then((server) => {
      assert(server);

      setTimeout(() => server.close(done), 1000);
    });
  });

  it('should have copied the uri to the clipboard', () => {
    assert.equal(clip.readSync(), 'http://localhost:8080');
  });
});
