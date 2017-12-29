#!/usr/bin/env node

'use strict';

if (!module.parent) {
  // eslint-disable-next-line global-require
  require('v8-compile-cache');
}

const chalk = require('chalk');
const meow = require('meow');
// const weblog = require('webpack-log');

const cli = meow(chalk`
{underline Usage}
  $ webpack-serve [options]

{underline Options}
  --host              The host the app should bind to
  --hmr               Enables Hot Module Replacement
  --https-cert        Specify a cert to enable https. Must be paired with a key
  --https-key         Specify a key to enable https. Must be paired with a cert
  --https-pass        Specify a passphrase to enable https. Must be paired with a pfx file
  --https-pfx         Specify a pfx file to enable https. Must be paired with a passphrase
  --log-level         Limit console messages to a specific level and above
                      {dim Levels: trace, debug, info, warn, error, silent}
  --log-time          Instruct the logger to display a timestamp
  --no-reload         Instruct middleware {italic not} to reload the page for build errors
  --open              Instruct the app to open in the default browser
  --open-browser      The browser to open the app within
  --open-path         The path with the app a browser should open to
  --port              The port the app should listen on
  --stdin-end-exit    End the webpack-serve process when stdin ends. Useful in container
                      environments.
  --version           Display the webpack-serve version

{underline Examples}
  $ webpack-serve --no-reload

{italic Note: You may also use all options available via the webpack cli.
Please see {underline https://webpack.js.org/api/cli/}}
`);

if (!cli.input.length && !Object.getOwnPropertyNames(cli.flags).length) {
  cli.showHelp();
}

// const log = weblog({ name: 'serve', id: 'webpack-serve/cli' });
// const { flags } = cli;
//
// function fail(message) {
//   log.error(message);
//   process.exit(1);
// }
