'use strict';

const assert = require('power-assert');
const serve = require('../../');
const { load, pause } = require('../util');

const timeout = process.env.TRAVIS_OS_NAME ? 10e3 : 500;

describe('webpack-serve Events', () => {
  before(pause);
  beforeEach(pause);

  it('should emit the listening event', (done) => {
    const config = load('./fixtures/basic/webpack.config.js');
    serve({ config }).then((server) => {
      server.on('listening', () => {
        assert(true);
        // occasionally close() will be called before the WebSocket server is up
        setTimeout(() => server.close(done), timeout);
      });
    });
  }).timeout(15e3);
});
