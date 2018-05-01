'use strict';

const updateNotifier = require('update-notifier');
const webpack = require('webpack');
const weblog = require('webpack-log');
const eventbus = require('./lib/bus');
const { timeFix, toArray } = require('./lib/config');
const getOptions = require('./lib/options');
const getServer = require('./lib/server');
const WebpackServeError = require('./lib/WebpackServeError');
const pkg = require('./package.json');

module.exports = (opts) => {
  updateNotifier({ pkg }).notify();

  process.env.WEBPACK_SERVE = true;

  return getOptions(opts)
    .then((results) => {
      const { options, configs } = results;
      const log = weblog({ name: 'serve', id: 'webpack-serve' });

      options.bus = eventbus(options);
      const { bus } = options;

      if (!options.compiler) {
        for (const config of configs) {
          toArray(config);
          timeFix(config);
        }

        try {
          options.compiler = webpack(configs.length > 1 ? configs : configs[0]);
        } catch (e) {
          throw new WebpackServeError(`An error was thrown while initializing Webpack\n  ${e.toString()}`);
        }
      }

      // if no context was specified in a config, and no --content options was
      // used, then we need to derive the context, and content location, from
      // the compiler.
      if (!options.content || !options.content.length) {
        options.content = [].concat(options.compiler.options.context || process.cwd());
      }

      const done = (stats) => {
        const json = stats.toJson();
        if (stats.hasErrors()) {
          bus.emit('compiler-error', json);
        }

        if (stats.hasWarnings()) {
          bus.emit('compiler-warning', json);
        }
      };

      if (options.compiler.hooks) {
        options.compiler.hooks.done.tap('WebpackServe', done);
      } else {
        options.compiler.plugin('done', done);
      }

      const { close, server, start } = getServer(options);

      start(options);

      let closing = false;
      const exit = (signal) => {
        if (!closing) {
          closing = true;
          close(() => {
            log.info(`Process Ended via ${signal}`);
            server.kill();
            process.exit(0);
          });
        }
      };

      for (const signal of ['SIGINT', 'SIGTERM']) {
        process.on(signal, () => exit(signal));
      }

      process.on('exit', exit);

      return Object.freeze({
        close,
        compiler: options.compiler,
        on(...args) {
          options.bus.on(...args);
        },
        options
      });
    })
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.log('An error was thrown while starting webpack-serve.\n  ', err);
      throw err;
    });
};
