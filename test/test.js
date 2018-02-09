'use strict';

process.setMaxListeners(20);

require('loud-rejection/register');

require('./tests/api');
require('./tests/cli');
require('./tests/events');
require('./tests/log');
require('./tests/options');
