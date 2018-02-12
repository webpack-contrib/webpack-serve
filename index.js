'use strict';

const updateNotifier = require('update-notifier');
const webpack = require('webpack');
const weblog = require('webpack-log');
const eventbus = require('./lib/bus');
const getOptions = require('./lib/options');
const getServer = require('./lib/server');
const pkg = require('./package.json');

module.exports = (opts) => {
  updateNotifier({ pkg }).notify();

  return getOptions(opts)
    .then((results) => {
      const { options, configs } = results;

      options.bus = eventbus(options);
      const { bus } = options;

      if (!options.compiler) {
        const config = configs.length > 1 ? configs : configs[0];

        if (typeof config.entry === 'string') {
          config.entry = [config.entry];
        }

        options.compiler = webpack(config);
      }

      options.compiler.plugin('failed', (error) => {
        bus.emit('error', error);
      });

      options.compiler.plugin('done', (stats) => {
        if (stats.hasErrors()) {
          bus.emit('compiler-error', stats.compilation.errors);
        }
        if (stats.hasWarnings()) {
          bus.emit('compiler-warning', stats.compilation.warnings);
        }
      });

      const { close, server, start } = getServer(options);

      start(options);

      for (const sig of ['SIGINT', 'SIGTERM']) {
        process.on(sig, () => { // eslint-disable-line no-loop-func
          close(() => {
            const log = weblog({ name: 'serve', id: 'webpack-serve' });
            log.info(`Process Ended via ${sig}`);
            server.kill();
            process.exit(0);
          });
        });
      }

      return Object.freeze({
        close,
        compiler: options.compiler,
        on(...args) {
          options.bus.on(...args);
        }
      });
    });
};
