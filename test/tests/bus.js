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

  it('should not allow non-object options', () => {
    const init = () => {
      eventbus({ on: 'foo' });
    };
    assert.throws(init);
  });

  it('should not allow a non-function handler', () => {
    const init = () => {
      eventbus({
        on: {
          foo: 'bar'
        }
      });
    };
    assert.throws(init);
  });
});
