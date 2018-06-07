const fs = require('fs');
const path = require('path');

const merge = require('lodash/merge');
const weblog = require('webpack-log');

const { load } = require('./config');

const defaults = {
  clipboard: true,
  compiler: null,
  config: {},
  content: [],
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
  protocol: 'http',
};

function parse(value) {
  try {
    return JSON.parse(value);
  } catch (e) {
    if (typeof value === 'string') {
      return value;
    }

    process.emitWarning(e);
    return null;
  }
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
  const flags = opts.flags || {};
  const nodeVersion = parseInt(process.version.substring(1), 10);

  return load(opts).then((configs) => {
    const [first] = configs;
    const options = merge({}, defaults, opts, flags, first.serve);
    const httpsFlags = pull(flags, 'https');
    const openFlags = pull(flags, 'open');

    if (httpsFlags) {
      options.https = httpsFlags;
    }

    if (options.https) {
      const { https } = options;
      for (const property of ['cert', 'key', 'pfx']) {
        const value = https[property];
        const isBuffer = value instanceof Buffer;

        if (value && !isBuffer) {
          // lstat seems to have a hard limit at 260
          if (value.length < 260 && fs.lstatSync(value).isFile()) {
            https[property] = fs.readFileSync(path.resolve(value));
          }
        }
      }

      if (https.pass) {
        https.passphrase = https.pass;
        delete https.pass;
      }
      options.protocol = 'https';
      options.https = https;
    }

    /* istanbul ignore if */
    if (openFlags) {
      if (!openFlags.path) {
        openFlags.path = '/';
      }
      options.open = openFlags;
    }

    if (typeof options.content === 'string') {
      options.content = [options.content];
    }

    if (!options.content || !options.content.length) {
      // if no context was specified in a config, and no --content options was
      // used, then we need to derive the context, and content location, from
      // the compiler.
      if (first.context) {
        options.content = [].concat(first.context);
      }

      options.content.push(process.cwd());
    }

    /* istanbul ignore if */
    if (options.http2 && nodeVersion < 9) {
      throw new TypeError(
        'webpack-serve: The `http2` option can only be used with Node v9 and higher.'
      );
    }

    if (flags.dev && typeof flags.dev === 'string') {
      options.dev = parse(flags.dev);

      if (typeof options.dev !== 'object') {
        throw new TypeError(
          'webpack-serve: The --dev flag must be a string contianing a valid JSON object.'
        );
      }
    }

    if (flags.hot && typeof flags.hot === 'string') {
      options.hot = parse(flags.hot);

      if (typeof options.hot !== 'object') {
        throw new TypeError(
          'webpack-serve: The --hot flag must be a string contianing a valid JSON object.'
        );
      }
    }

    if (flags.hotClient === false) {
      options.hot = false;
    } else {
      /* istanbul ignore if */
      if (flags.hot === false) {
        options.hot = Object.assign({}, options.hot, { hot: false });
      }

      /* istanbul ignore if */
      if (flags.reload === false) {
        options.hot = Object.assign({}, options.hot, { reload: false });
      }
    }

    // because you just know someone is going to do this
    if (options.hot === true) {
      options.hot = defaults.hot;
    }

    if (options.hot) {
      if (options.hot.host) {
        const hotHost = options.hot.host.server || options.hot.host;
        if (hotHost !== options.host) {
          throw new TypeError(
            'webpack-serve: The `hot.host` (or `hot.host.server`) property must match the `host` option.'
          );
        }
      } else {
        options.hot.host = options.host;
      }
    }

    /* istanbul ignore if */
    if (flags.openApp) {
      options.open = Object.assign({}, options.open, {
        app: parse(flags.openApp),
      });
    }

    /* istanbul ignore if */
    if (flags.openPath) {
      options.open = Object.assign({}, options.open, {
        path: flags.openPath,
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
      timestamp: options.logTime,
    });

    // cleanup - doing this here so as not to mutate the options passed in.
    delete options.config;

    // this isn't part of the webpack options schema, and doesn't need to be
    delete configs[0].serve; // eslint-disable-line no-param-reassign

    return { configs, options };
  });
};

// this is exported so we can get coverage on the function
// not intended to be used externally
module.exports.parse = parse;
