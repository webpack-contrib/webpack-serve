#!/usr/bin/env node

'use strict';

const chalk = require('chalk');
const meow = require('meow');
// const weblog = require('webpack-log');

const cli = meow(chalk`
{underline Usage}
  $ webpack-serve [options]

{underline Options}
  --log-level                 Specify a log level; trace, debug, info, warn, error, silent
  --log-time                  Instruct the logger to display a timestamp
  --version                   Display the webpack-serve version

{underline Examples}
  $ webpack-serve --no-colors
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
