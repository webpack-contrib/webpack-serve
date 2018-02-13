'use strict';

process.setMaxListeners(20);

const { register } = require('../lib/global');

register();

require('./tests/api');
require('./tests/bus');
require('./tests/cli');
require('./tests/events');
require('./tests/log');
require('./tests/options');
