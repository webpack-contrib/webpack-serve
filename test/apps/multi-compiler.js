const webpack = require('webpack');

const serve = require('../../');
const config = require('../fixtures/multi/webpack.config.js');

const argv = {};
const options = Object.assign({}, config.serve);

delete config[0].serve;
for (const conf of config) {
  conf.entry = [conf.entry];
}

const compiler = webpack(config);
options.compiler = compiler;

serve(argv, options);
