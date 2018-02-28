'use strict';

// eslint-disable-next-line global-require, import/order
const { register } = require('../../lib/global');

register();

const serve = require('../../');
const config = require('../fixtures/basic/webpack.config.js');

config.serve.hot = { server: 'fake' };
serve({ config });
