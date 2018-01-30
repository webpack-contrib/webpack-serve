'use strict';

const assert = require('power-assert');
const serve = require('../../');
const { load } = require('../util');

describe('webpack-serve Events', () => {
  it('should emit the listening event', (done) => {
    const config = load('./fixtures/basic/webpack.config.js');
    serve({ config }).then((server) => {
      server.on('listening', () => {
        assert(true);
        // occasionally close() will be called before the WebSocket server is up
        setTimeout(() => server.close(done), 500);
      });
    });
  }).timeout(10000);
});
