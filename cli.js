#!/usr/bin/env node

'use strict';

if (!module.parent) {
  // eslint-disable-next-line global-require
  const { register } = require('./lib/global');

  register();
}

const chalk = require('chalk');
const cosmiconfig = require('cosmiconfig');
const debug = require('debug')('webpack-serve');
const meow = require('meow');
const merge = require('lodash/merge');
const resolveModule = require('resolve').sync;
const importLocal = require('import-local'); // eslint-disable-line import/order

// Prefer the local installation of webpack-serve
/* istanbul ignore if */
if (importLocal(__filename)) {
  debug('Using local install of webpack-serve');
}

const serve = require('./');

const cli = meow(chalk`
{underline Usage}
  $ webpack-serve <config> [...options]

{underline Options}
  --config            The webpack config to serve. Alias for <config>.
  --content           The path from which content will be served
  --dev               A JSON object containing options for webpack-dev-middleware
  --help              Show usage information and the options listed here.
  --host              The host the app should bind to
  --hot               A JSON object containing options for webpack-hot-client
  --http2             Instruct the server to use HTTP2
  --https-cert        Specify a cert to enable https. Must be paired with a key
  --https-key         Specify a key to enable https. Must be paired with a cert
  --https-pass        Specify a passphrase to enable https. Must be paired with a pfx file
  --https-pfx         Specify a pfx file to enable https. Must be paired with a passphrase
  --log-level         Limit all process console messages to a specific level and above
                      {dim Levels: trace, debug, info, warn, error, silent}
  --log-time          Instruct the logger for webpack-serve and dependencies to display a timestamp
  --no-hot-client     Instruct the server to completely disable automatic HMR functionality
  --no-hot            Instruct the client not to apply Hot Module Replacement patches
  --no-reload         Instruct middleware {italic not} to reload the page for build errors
  --open              Instruct the app to open in the default browser
  --open-app          The name of the app to open the app within, or an array
                      containing the app name and arguments for the app
  --open-path         The path with the app a browser should open to
  --port              The port the app should listen on
  --require, -r       Preload one or more modules before loading the webpack configuration
  --version           Display the webpack-serve version

{underline Examples}
  $ webpack-serve ./webpack.config.js --no-reload
  $ webpack-serve --config ./webpack.config.js --port 1337
  $ webpack-serve # config can be omitted for webpack v4+ only
`, {
  flags: {
    require: {
      alias: 'r',
      type: 'string'
    }
  }
});

const flags = Object.assign({}, cli.flags);

if (flags.require) {
  if (typeof flags.require === 'string') {
    flags.require = [flags.require];
  }
  const cwd = process.cwd();
  for (const module of flags.require) {
    if (module) {
      // eslint-disable-next-line global-require, import/no-dynamic-require
      require(resolveModule(module, { basedir: cwd }));
    }
  }
}

const cosmicOptions = {
  rcExtensions: true,
  sync: true
};
const explorer = cosmiconfig('serve', cosmicOptions);
const { config } = explorer.load() || {};
const options = merge({ flags }, config);

if (cli.input.length) {
  [flags.config] = cli.input;
} else if (!flags.config) {
  const webpackExplorer = cosmiconfig('webpack', cosmicOptions);
  const webpackConfig = webpackExplorer.load();

  if (webpackConfig) {
    options.config = webpackConfig.config;
    flags.config = webpackConfig.filepath;
  }
}

if (flags.help) {
  cli.showHelp(0);
}

if (!flags.config) {
  // webpack v4 defaults an empty config to { entry: './src' }. but since we
  // need an array, we'll mimic that default config.
  options.config = { entry: ['./src'] };
}

serve(options)
  .catch(() => {
    process.exit(1);
  });
