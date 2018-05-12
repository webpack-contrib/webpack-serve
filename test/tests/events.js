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
      server.on('listening', ({ server: servr, options }) => {
        assert(servr);
        assert(options);
        // occasionally close() will be called before the WebSocket server is up
        setTimeout(() => {
          server.close(done);
        }, timeout);
      });
    });
  }).timeout(15e3);

  it('should emit the compiler-error event', (done) => {
    const config = load('./fixtures/error/webpack.config.js');
    serve({ config }).then((server) => {
      server.on('compiler-error', ({ json, compiler }) => {
        assert(json);
        assert(compiler);
        setTimeout(() => {
          server.close(done);
        }, timeout);
      });
    });
  }).timeout(5e3);

  it('should emit the compiler-warning event', (done) => {
    const config = load('./fixtures/warning/webpack.config.js');
    serve({ config }).then((server) => {
      server.on('compiler-warning', ({ json, compiler }) => {
        assert(json);
        assert(compiler);
        setTimeout(() => {
          server.close(done);
        }, timeout);
      });
    });
  }).timeout(5e3);

  it('should emit the build-started event', (done) => {
    const config = load('./fixtures/basic/webpack.config.js');
    serve({ config }).then((server) => {
      server.on('build-started', ({ compiler }) => {
        assert(compiler);
        setTimeout(() => {
          server.close(done);
        }, timeout);
      });
    });
  }).timeout(5e3);

  it('should emit the build-finished event', (done) => {
    const config = load('./fixtures/basic/webpack.config.js');
    serve({ config }).then((server) => {
      server.on('build-finished', ({ stats, compiler }) => {
        assert(stats);
        assert(compiler);
        setTimeout(() => {
          server.close(done);
        }, timeout);
      });
    });
  }).timeout(5e3);
});
