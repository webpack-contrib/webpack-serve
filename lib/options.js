'use strict';

const path = require('path');
const weblog = require('webpack-log');
const MultiCompiler = require('webpack/lib/MultiCompiler');
const webpackPackage = require('webpack/package.json');

const webpackVersion = parseInt(webpackPackage.version, 10);

const defaults = {
  compiler: null,
  config: {},
  content: [],
  // undocumented, used for tests
  // context: null,
  dev: { publicPath: '/' },
  flags: {},
  host: 'localhost',
  hot: {},
  http2: false,
  https: null,
  // https: {
  //   key: fs.readFileSync('...key'),
  //   cert: fs.readFileSync('...cert'),
  //   pfx: ...,
  //   passphrase: ...
  // },
  logLevel: 'info',
  logTime: false,
  open: false,
  // open: { app: <String>, path: <String> }
  port: 8080,
  protocol: 'http'
};

function resolve(options) {
  const { compiler } = options;

  if (compiler) {
    let configs = [];
    if (compiler instanceof MultiCompiler) {
      const { compilers } = compiler;
      configs = compilers.map(c => c.options);
    } else {
      configs = [compiler.options];
    }

    return Promise.resolve(configs);
  }

  // webpack v4 defaults an empty config to { entry: './src' }. but since we
  // need an array, we'll mimic that default config.
  if (webpackVersion > 3 && !options.config && (!options.flags || !options.flags.config)) {
    options.config = { entry: ['./src'] };
  }

  if (options.config) {
    return Promise.resolve([].concat(options.config));
  }

  const configPath = path.resolve(options.flags.config || options.config);
  // eslint-disable-next-line global-require, import/no-dynamic-require
  let config = require(configPath);

  // support webpack options which return a promise by asserting that all
  // passed options are wrapped in a promise
  if (typeof config.then !== 'function') {
    config = Promise.resolve(config);
  }

  return config
    .then(configs => [].concat(configs))
    .catch((e) => {
      throw e;
    });
}

function pull(obj, prefix) {
  let result;
  for (const key of Object.keys(obj)) {
    if (key.indexOf(prefix) === 0) {
      if (!result) {
        result = {};
      }
      const name = key.replace(prefix, '').toLowerCase();
      result[name] = obj[key];
    }
  }
  return result;
}

module.exports = (opts) => {
  const flags = (opts.flags || {});
  const nodeVersion = parseInt(process.version.substring(1), 10);

  return resolve(opts).then((configs) => {
    const [first] = configs;
    const options = Object.assign({}, defaults, opts, flags, configs[0].serve);
    const https = pull(flags, 'https');
    const open = pull(flags, 'open');

    if (https) {
      options.https = https;
      options.protocol = 'https';
    }

    /* istanbul ignore if */
    if (open) {
      if (!open.path) {
        open.path = '/';
      }
      options.open = open;
    }

    if (typeof options.content === 'string') {
      options.content = [options.content];
    }

    if (!options.content || !options.content.length) {
      if (first.context) {
        options.content = [].concat(first.context);
      }

      options.content.push(process.cwd());
    }

    // if (options.context) {
    //   for (const config of configs) {
    //     if (!config.context) {
    //       config.context = options.context;
    //     }
    //   }
    // }

    /* istanbul ignore if */
    if (options.http2 && nodeVersion < 9) {
      throw new Error('webpack-serve: The `http2` option can only be used with Node v9 and higher.');
    }

    if (options.hot.host && options.host && options.hot.host !== options.host) {
      throw new Error('webpack-serve: The `hot.host` property must match `host` option.');
    } else if (!options.hot.host) {
      options.hot.host = options.host;
    }

    /* istanbul ignore if */
    if (flags.hot === false) {
      options.hot = Object.assign({}, options.hot, { hot: false });
    }

    /* istanbul ignore if */
    if (flags.reload === false) {
      options.hot = Object.assign({}, options.hot, { reload: false });
    }

    /* istanbul ignore if */
    if (flags.openApp) {
      options.open = Object.assign({}, options.open, {
        app: JSON.parse(flags.openApp)
      });
    }

    /* istanbul ignore if */
    if (flags.openPath) {
      options.open = Object.assign({}, options.open, {
        path: JSON.parse(flags.openPath)
      });
    }

    if (flags.logLevel) {
      options.logLevel = flags.logLevel;
      options.dev = Object.assign(options.dev, { logLevel: options.logLevel });
      options.hot = Object.assign(options.hot, { logLevel: options.logLevel });
    }

    if (flags.logTime) {
      options.logTime = true;
      options.dev = Object.assign(options.dev, { logTime: true });
      options.hot = Object.assign(options.hot, { logTime: true });
    }

    // initialize the shared log
    weblog({
      name: 'serve',
      id: 'webpack-serve',
      level: options.logLevel,
      timestamp: options.logTime
    });

    // cleanup - doing this here so as not to mutate the options passed in.
    delete options.config;

    // this isn't part of the webpack options schema, and doesn't need to be
    delete configs[0].serve;

    return { configs, options };
  });
};
