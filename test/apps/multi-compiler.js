const webpack = require('webpack');

const serve = require('../../');
const config = require('../fixtures/multiple/webpack.config.js');

const options = Object.assign({}, config.serve);
delete config[0].serve;

const compiler = webpack(config);
options.compiler = compiler;

serve(options);
