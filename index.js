'use strict';

if (!module.parent) {
  // eslint-disable-next-line global-require
  require('v8-compile-cache');
}

// eslint-disable-next-line global-require
require('loud-rejection/register');

const updateNotifier = require('update-notifier');
const webpack = require('webpack');
const getOptions = require('./lib/options');
const getServer = require('./lib/server');
const pkg = require('./package.json');

module.exports = (opts) => {
  updateNotifier({ pkg }).notify();

  getOptions(opts).then((results) => {
    const { options, configs } = results;
    const config = configs.length > 1 ? configs : configs[0];
    const compiler = webpack(config);

    options.compiler = compiler;

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
      process.on(sig, () => close(process.exit));
    }
  });
};
