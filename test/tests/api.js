'use strict';

const assert = require('power-assert');
const serve = require('../../');
const { load } = require('../util');

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
});
