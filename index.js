'use strict';

const TimeFixPlugin = require('time-fix-plugin');
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
        for (const config of configs) {
          if (typeof config.entry === 'string') {
            config.entry = [config.entry];
          }

          // adds https://github.com/egoist/time-fix-plugin if not already added
          // to the config.
          if (config.plugins) {
            let timeFixFound = false;
            for (const plugin of config.plugins) {
              if (!timeFixFound && plugin instanceof TimeFixPlugin) {
                timeFixFound = true;
              }
            }

            if (!timeFixFound) {
              config.plugins.unshift(new TimeFixPlugin());
            }
          } else {
            config.plugins = [new TimeFixPlugin()];
          }
        }

        options.compiler = webpack(configs.length > 1 ? configs : configs[0]);
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
