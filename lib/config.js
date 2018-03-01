'use strict';

const isPlainObject = require('lodash.isplainobject');
const TimeFixPlugin = require('time-fix-plugin');

module.exports = {

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
  },

  // wraps configs that export a function, in a function that assures entries
  // will be an array
  wrap(config) {
    const fn = function wrap(env, argv) {
      const result = config(env, argv);
      if (Array.isArray(result)) {
        for (const conf of result) {
          module.exports.toArray(conf);
          module.exports.timeFix(conf);
        }
      } else {
        module.exports.toArray(result);
        module.exports.timeFix(result);
      }
      return result;
    };
    return fn;
  }
};
