/* eslint no-console: off */
const { join } = require('path');

const { register } = require('../../lib/global');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

register();

const pfx = join(__dirname, '../fixtures/test_cert.pfx');
const passphrase = 'sample';
const serve = require('../../');
const config = require('../fixtures/basic/webpack.config.js');

config.serve.https = { passphrase, pfx };

serve({ config }).catch(() => {});
