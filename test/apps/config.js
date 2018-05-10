/* eslint no-console: off */
// eslint-disable-next-line global-require, import/order
const { register } = require('../../lib/global');

register();

const serve = require('../../');
const config = require('../fixtures/basic/webpack.config.js');

serve({ config }).catch(() => {});
