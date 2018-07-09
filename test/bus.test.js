const weblog = require('webpack-log');

const eventbus = require('../lib/bus');

describe('bus', () => {
  weblog({ id: 'webpack-serve', level: 'silent', name: 'serve' });

  test('should subscribe to events in options', async () =>
    new Promise((resolve) => {
      const bus = eventbus({
        on: {
          foo: () => {
            expect(true);
            resolve();
          },
        },
      });

      bus.emit('foo');
    }));

  test('should not allow non-object options', () => {
    const fn = () => {
      eventbus({ on: 'foo' });
    };
    expect(fn).toThrowErrorMatchingSnapshot();
  });

  test('should not allow a non-function handler', () => {
    const fn = () => {
      eventbus({
        on: {
          foo: 'bar',
        },
      });
    };
    expect(fn).toThrowErrorMatchingSnapshot();
  });
});
