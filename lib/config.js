'use strict';

const isPlainObject = require('lodash/isPlainObject');
const TimeFixPlugin = require('time-fix-plugin');
const weblog = require('webpack-log');

module.exports = {

  fromFunction(config, argv) {
    if (typeof config === 'function') {
      const log = weblog({ name: 'serve', id: 'webpack-serve' });
      log.warn('It is not recommended to use configs which export a function. Please see the README for more information.');
      return config('development', argv);
    }

    return config;
  },

  // adds https://github.com/egoist/time-fix-plugin if not already added
  // to the config.
  timeFix(config) {
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
  },

  // automagically wrap hot-client-invalid entry values in an array
  toArray(config) {
    if (typeof config.entry === 'string') {
      config.entry = [config.entry];
    } else if (isPlainObject(config.entry)) {
      for (const key of Object.keys(config.entry)) {
        const entry = config.entry[key];

        if (!Array.isArray(entry)) {
          config.entry[key] = [entry];
        }
      }
    }
  }
};
