'use strict';

const webpack = require('webpack');
const serve = require('../../');
const config = require('../fixtures/basic/webpack.config.js');

const options = Object.assign({}, config.serve);
delete config.serve;

const compiler = webpack(config);
options.compiler = compiler;

serve(options);
