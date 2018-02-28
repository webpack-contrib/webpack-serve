'use strict';

const nanobus = require('nanobus');
const weblog = require('webpack-log');

module.exports = (options) => {
  const log = weblog({ name: 'serve', id: 'webpack-serve' });
  const bus = nanobus();

  if (typeof options.on === 'object') {
    for (const event of Object.keys(options.on)) {
      const fn = options.on[event];

      if (typeof fn === 'function') {
        log.info(`Subscribed to '${event}' event`);
        bus.on(event, fn);
      }
    }
  }

  return bus;
};
