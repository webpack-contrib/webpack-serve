'use strict';

if (!module.parent) {
  // eslint-disable-next-line global-require
  require('v8-compile-cache');
}

// eslint-disable-next-line global-require
require('loud-rejection/register');

const updateNotifier = require('update-notifier');
const webpack = require('webpack');
const weblog = require('webpack-log');
const eventbus = require('./lib/bus');
const getOptions = require('./lib/options');
const getServer = require('./lib/server');
const pkg = require('./package.json');

module.exports = (opts) => {
  updateNotifier({ pkg }).notify();

  return getOptions(opts).then((results) => {
    const { options, configs } = results;

    options.bus = eventbus(options);

    if (!options.compiler) {
      const config = configs.length > 1 ? configs : configs[0];

      if (typeof config.entry === 'string') {
        config.entry = [config.entry];
      }

      options.compiler = webpack(config);
    }

    const { close, server, start } = getServer(options);

    start(options);

    if (options.stdinEndExit) {
      process.stdin.on('end', () => {
        server.kill();
        process.exit(0); // eslint-disable-line no-process-exit
      });
      process.stdin.resume();
    }

    for (const sig of ['SIGINT', 'SIGTERM']) {
      process.on(sig, () => { // eslint-disable-line no-loop-func
        close(() => {
          const log = weblog({ name: 'serve', id: 'webpack-serve' });
          log.info(`Process Ended via ${sig}`);
          process.exit();
        });
      });
    }

    return {
      close,
      on(...args) {
        options.bus.on(...args);
      }
    };
  });
};
