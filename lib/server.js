'use strict';

const http = require('http');
const chalk = require('chalk');
const getPort = require('get-port');
const Koa = require('koa');
const koaWebpack = require('koa-webpack');
const nanobus = require('nanobus');
const open = require('opn');
const serveStatic = require('koa-static');
const urljoin = require('url-join');
const weblog = require('webpack-log');

const app = new Koa();
const bus = nanobus();

const log = weblog({ name: 'serve', id: 'webpack-serve' });

const defaults = {
  content: [],
  host: 'localhost',
  open: false,
  // open: { app: <String>, path: <String> }
  port: 8080,
  protocol: 'http'
};

function start(opts) {
  const options = Object.assign({}, defaults, opts);
  const middleware = {
    webpack: () => {
      middleware.webpack.called = true;
      app.use(koaWebpack({
        // be explicit about what we want to pass, rather than passing the entire
        // options object
        compiler: options.compiler,
        dev: options.dev,
        hot: options.hot
      }));
    },
    content: () => {
      middleware.content.called = true;
      for (const dir of options.content) {
        app.use(serveStatic(dir));
      }
    }
  };

  if (typeof options.content === 'string') {
    options.content = [options.content];
  }

  if (typeof options.add === 'function') {
    options.add(app, middleware, options);
  }

  if (typeof options.on === 'object') {
    for (const event of Object.keys(options.on)) {
      const fn = options.on[event];

      if (typeof fn === 'function') {
        log.info(event, fn);
        bus.on(event, fn);
      }
    }
  }

  // allow consumers to specifically order middleware
  if (!middleware.webpack.called) {
    middleware.webpack();
  }

  if (!middleware.content.called) {
    middleware.content();
  }

  getPort({ port: options.port }).then((port) => {
    options.port = port;
    listen(options);
  });
}

function listen(options) {
  const server = http.createServer(app.callback());
  const uri = `${options.protocol}://${options.host}:${options.port}`;

  server.listen(options.port, options.host);

  server.on('error', err => log.error(err));

  server.once('listening', () => {
    bus.emit('listening', server);

    log.info(chalk`Project is running at {blue ${uri}}`);

    if (options.open) {
      open(urljoin(uri, options.open.path || ''), options.open);
    }
  });
}

module.exports = { start };
