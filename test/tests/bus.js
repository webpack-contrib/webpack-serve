'use strict';

const assert = require('power-assert');
const eventbus = require('../../lib/bus');

describe('webpack-serve Event Bus', () => {
  it('should subscribe to events in options', (done) => {
    const bus = eventbus({
      on: {
        foo: () => {
          assert(true);
          done();
        }
      }
    });

    bus.emit('foo');
  });
});
