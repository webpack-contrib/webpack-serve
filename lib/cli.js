#!/usr/bin/env node

/* istanbul ignore next */
if (!module.parent) {
  // eslint-disable-next-line global-require
  const { register } = require('./global');

  register();
}

const { getHelp, getOpts } = require('@webpack-contrib/cli-utils');
const chalk = require('chalk');
const cosmiconfig = require('cosmiconfig');
const debug = require('debug')('webpack-serve');
const meow = require('meow');
const importLocal = require('import-local'); // eslint-disable-line import/order

// Prefer the local installation of webpack-serve
/* istanbul ignore if */
if (importLocal(__filename)) {
  debug('Using local install of webpack-serve');
}

const flagSchema = require('../schemas/flags');

const serve = require('./');

// eslint-disable-next-line no-undefined
const flagOptions = { booleanDefault: undefined, flags: getOpts(flagSchema) };
const help = getHelp(flagSchema);
const cli = meow(
  chalk`
{underline Usage}
  $ webpack-serve <config> [...options]

{underline Options}
${help}

{italic Note: Any boolean flag can be prefixed with 'no-' instead of specifying a value.
e.g. --no-reload rather than --reload=false}

{underline Examples}
  $ webpack-serve ./webpack.config.js --no-reload
  $ webpack-serve --config ./webpack.config.js --port 1337
  $ webpack-serve # config can be omitted for webpack v4+ only
`,
  flagOptions
);

const argv = Object.assign({}, cli.flags);
const explorer = cosmiconfig('serve', {});
let { config } = explorer.searchSync() || {};

if (cli.input.length) {
  [config] = cli.input;
}

serve(argv, { config }).catch(() => {
  /* istanbul ignore next */
  process.exit(1);
});
