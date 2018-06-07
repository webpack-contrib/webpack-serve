process.setMaxListeners(20);

const { register } = require('../lib/global');

register();

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

require('./tests/api');
require('./tests/bus');
require('./tests/cli');
require('./tests/events');
require('./tests/log');
require('./tests/options');
