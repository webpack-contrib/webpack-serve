const updateNotifier = require('update-notifier');
const webpack = require('webpack');
const weblog = require('webpack-log');

const eventbus = require('./lib/bus');
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
        try {
          options.compiler = webpack(configs.length > 1 ? configs : configs[0]);
        } catch (e) {
          throw new WebpackServeError(
            `An error was thrown while initializing Webpack\n  ${e.toString()}`
          );
        }
      }

      const compilers = options.compiler.compilers || [options.compiler];
      for (const comp of compilers) {
        comp.hooks.compile.tap('WebpackServe', () => {
          bus.emit('build-started', { compiler: comp });
        });

        comp.hooks.done.tap('WebpackServe', (stats) => {
          const json = stats.toJson();
          if (stats.hasErrors()) {
            bus.emit('compiler-error', { json, compiler: comp });
          }

          if (stats.hasWarnings()) {
            bus.emit('compiler-warning', { json, compiler: comp });
          }

          bus.emit('build-finished', { stats, compiler: comp });
        });
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
        options,
      });
    })
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.log('An error was thrown while starting webpack-serve.\n  ', err);
      throw err;
    });
};
