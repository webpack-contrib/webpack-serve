'use strict';

const yargs = require('yargs');
const weblog = require('webpack-log');
const convertArgv = require('webpack/bin/convert-argv');

const defaults = {
  content: [],
  dev: { publicPath: '/' },
  host: 'localhost',
  hot: {},
  http2: false,
  https: false,
  // https: {
  //   key: fs.readFileSync('...key'),
  //   cert: fs.readFileSync('...cert'),
  //   pfx: ...,
  //   passphrase: ...
  // },
  index: 'index.html',
  logLevel: 'info',
  logTime: false,
  open: false,
  // open: { app: <String>, path: <String> }
  port: 8080,
  protocol: 'http'
};

function resolve(argv) {
  let config = convertArgv({}, argv, {
    outputFilename: '/bundle.js'
  });
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

module.exports = (opts) => {
  const { cli } = (opts || {});
  const flags = (cli || {});
  // webpack's bin/convert-args is locked down to use yargs
  // sadly we don't have a choice here.
  const { argv } = yargs;
  const nodeVersion = parseInt(process.version.substring(1), 10);

  return resolve(argv).then((configs) => {
    const [first] = configs;
    const options = Object.assign({}, defaults, flags, configs[0].serve);

    weblog({
      name: 'serve',
      id: 'webpack-serve',
      logLevel: options.logLevel,
      logTime: options.logTime
    });

    if (typeof options.content === 'string') {
      options.content = [options.content];
    }

    if ((!options.content || !options.content.length) && first.context) {
      options.content = [].concat(first.context);
    }

    if (options.http2 && nodeVersion < 9) {
      throw new Error('webpack-serve: The `http2` option can only be used with Node v9 and higher.');
    }

    // this isn't part of the webpack options schema, and doesn't need to be
    delete configs[0].serve;

    return { configs, options };
  });
};
