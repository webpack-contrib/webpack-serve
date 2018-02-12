'use strict';

// eslint-disable-next-line global-require, import/order
const { babel, register } = require('../../lib/global');

register();
babel();

const serve = require('../../');
const config = require('../fixtures/basic/webpack.config.js');

serve({ config });
