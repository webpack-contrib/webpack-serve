'use strict';

const assert = require('power-assert');
const serve = require('../../');
const { load, pause } = require('../util');

const timeout = process.env.CIRCLECI ? 2e3 : 500;

describe('webpack-serve Events', () => {
  before(pause);
  beforeEach(pause);

  it('should emit the listening event', (done) => {
    const config = load('./fixtures/basic/webpack.config.js');
    serve({ config }).then((server) => {
      server.on('listening', () => {
        assert(true);
        // occasionally close() will be called before the WebSocket server is up
        setTimeout(() => { server.close(done); }, timeout);
      });
    });
  }).timeout(15e3);


  it('should emit the compiler-error event', (done) => {
    const config = load('./fixtures/error/webpack.config.js');
    serve({ config }).then((server) => {
      server.on('compiler-error', () => {
        assert(true);
        setTimeout(() => { server.close(done); }, timeout);
      });
    });
  }).timeout(5e3);

  it('should emit the compiler-warning event', (done) => {
    const config = load('./fixtures/warning/webpack.config.js');
    serve({ config }).then((server) => {
      server.on('compiler-warning', () => {
        assert(true);
        setTimeout(() => { server.close(done); }, timeout);
      });
    });
  }).timeout(5e3);
});
