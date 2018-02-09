'use strict';

process.setMaxListeners(20);

require('loud-rejection/register');
// require this first so the require mocks are setup properly
require('./util');

require('./tests/api');
require('./tests/cli');
require('./tests/events');
require('./tests/log');
require('./tests/options');
