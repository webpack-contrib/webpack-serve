#!/usr/bin/env node

'use strict';

if (!module.parent) {
  // eslint-disable-next-line global-require
  const { register } = require('./lib/global');

  register();
}

const chalk = require('chalk');
const debug = require('debug')('webpack-serve');
const findUp = require('find-up');
const meow = require('meow');
const importLocal = require('import-local'); // eslint-disable-line import/order
const WebpackServeError = require('./lib/WebpackServeError'); // eslint-disable-line import/order

let webpackPackage;
let webpackVersion;

try {
  webpackPackage = require('webpack/package.json'); // eslint-disable-line global-require
  webpackVersion = parseInt(webpackPackage.version, 10);
} catch (e) {
  throw new WebpackServeError('webpack must be installed for webpack-serve to function.\n  See: webpack-serve/package.json/peerDependencies');
}


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
  --dev               An object containing options for webpack-dev-middleware
  --help              Show usage information and the options listed here.
  --host              The host the app should bind to
  --http2             Instruct the server to use HTTP2
  --https-cert        Specify a cert to enable https. Must be paired with a key
  --https-key         Specify a key to enable https. Must be paired with a cert
  --https-pass        Specify a passphrase to enable https. Must be paired with a pfx file
  --https-pfx         Specify a pfx file to enable https. Must be paired with a passphrase
  --log-level         Limit all process console messages to a specific level and above
                      {dim Levels: trace, debug, info, warn, error, silent}
  --log-time          Instruct the logger for webpack-serve and dependencies to display a timestamp
  --no-hot            Instruct the client not to apply Hot Module Replacement patches
  --no-reload         Instruct middleware {italic not} to reload the page for build errors
  --open              Instruct the app to open in the default browser
  --open-app          The name of the app to open the app within
  --open-path         The path with the app a browser should open to
  --port              The port the app should listen on
  --version           Display the webpack-serve version

{underline Examples}
  $ webpack-serve ./webpack.config.js --no-reload
  $ webpack-serve --config ./webpack.config.js --port 1337
  $ webpack-serve # config can be omitted for webpack v4+ only
`);

const flags = Object.assign({}, cli.flags);

if (cli.input.length) {
  [flags.config] = cli.input;
} else if (!flags.config) {
  const filePath = findUp.sync('webpack.config.js');
  flags.config = filePath;
}

if (flags.help) {
  cli.showHelp(0);
}

const options = { flags };

if (!flags.config) {
  if (webpackVersion < 4) {
    cli.showHelp(0);
  } else {
    // webpack v4 defaults an empty config to { entry: './src' }. but since we
    // need an array, we'll mimic that default config.
    options.config = { entry: ['./src'] };
  }
}

serve(options);
