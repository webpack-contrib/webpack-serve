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
        server.close(done);
      });
    });
  }).timeout(10000);
});
