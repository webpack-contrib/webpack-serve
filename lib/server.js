'use strict';

const http = require('http');
const chalk = require('chalk');
const getPort = require('get-port');
const weblog = require('webpack-log');
const Koa = require('koa');
const serveStatic = require('koa-static');
const middleware = require('koa-webpack');

const app = new Koa();

const log = weblog({ name: 'serve', id: 'webpack-serve' });

const defaults = {
  content: [],
  host: 'localhost',
  port: 8080,
  protocol: 'http'
};

function start(opts) {
  const options = Object.assign({}, defaults, opts);

  if (typeof options.content === 'string') {
    options.content = [options.content];
  }

  app.use(middleware({
    compiler: options.compiler,
    dev: {
      publicPath: '/'
    },
    hot: {
      log: log.info,
      path: '/__webpack_hmr',
      heartbeat: 10 * 1000,
      reload: true
    }
  }));

  for (const dir of options.content) {
    app.use(serveStatic(dir));
  }

  getPort({ port: options.port }).then((port) => {
    options.port = port;
    listen(options);
  });
}

function listen(options) {
  const server = http.createServer(app.callback());
  const uri = `${options.protocol}://${options.host}:${options.port}`;

  server.listen(options.port);

  server.on('error', err => log.error(err));

  server.once('listening', () => log.info(chalk`Project is running at {blue ${uri}}`));
}

module.exports = { start };
