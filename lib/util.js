'use strict';

const uuid = require('uuid/v4');

module.exports = {
  addEntry(config) {
    const configs = [].concat(config);
    const script = 'webpack-hot-middleware/client';

    for (const conf of configs) {
      // when defining multiple compilers, each compiler config needs to define
      // a `name`. otherwise the hot-middleware can get confused.
      // https://github.com/glenjamin/webpack-hot-middleware#multi-compiler-mode
      if (!conf.name) {
        conf.name = uuid();
      }

      const { name } = config;
      const hotEntry = [`${script}?=${name}`];

      if (typeof conf.entry === 'object' && !Array.isArray(conf.entry)) {
        for (const key of Object.keys(conf.entry)) {
          conf.entry[key] = hotEntry.concat(conf.entry[key]);
        }
      } else if (typeof conf.entry === 'function') {
        conf.entry = conf.entry(hotEntry);
      } else {
        conf.entry = hotEntry.concat(conf.entry);
      }
    }
  }
};
