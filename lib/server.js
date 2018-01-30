'use strict';

const http = require('http');
const https = require('https');
const chalk = require('chalk');
const clip = require('clipboardy');
const getPort = require('get-port');
const killable = require('killable');
const Koa = require('koa');
const koaWebpack = require('koa-webpack');
const open = require('opn');
const serveStatic = require('koa-static');
const urljoin = require('url-join');
const weblog = require('webpack-log');

module.exports = (options) => {
  const app = new Koa();
  const { bus } = options;
  const log = weblog({ name: 'serve', id: 'webpack-serve' });
  const uri = `${options.protocol}://${options.host}:${options.port}`;
  let http2;
  let server;
  let koaMiddleware;

  const middleware = {
    webpack: () => {
      middleware.webpack.called = true;

      getPort({ port: options.hot.port || 8081 }).then((port) => {
        koaMiddleware = koaWebpack({
          // be explicit about what we want to pass, rather than passing the entire
          // options object
          compiler: options.compiler,
          dev: options.dev,
          hot: Object.assign(options.hot, { port })
        });
        app.use(koaMiddleware);
      });
    },
    content: (staticOptions) => {
      middleware.content.called = true;
      for (const dir of options.content) {
        app.use(serveStatic(dir, staticOptions || {}));
      }
    }
  };

  if (options.http2) {
    // the check for if we can do this is in options.js
    http2 = require('http2'); // eslint-disable-line
  }

  if (options.https) {
    if (http2) {
      server = http2.createSecureServer(options.https, app.callback());
    } else {
      server = https.createServer(options.https, app.callback());
    }
  } else {
    server = (http2 || http).createServer(app.callback());
  }

  killable(server);

  server.on('error', err => log.error(err));

  return {
    server,
    close(callback) {
      server.kill(() => {
        koaMiddleware.close(callback);
      });
    },
    start() {
      if (typeof options.add === 'function') {
        options.add(app, middleware, options);
      }

      if (!middleware.content.called) {
        middleware.content();
      }

      // allow consumers to specifically order middleware
      if (!middleware.webpack.called) {
        middleware.webpack();
      }

      getPort({ port: options.port })
        .then((port) => {
          options.port = port;

          server.listen(options.port, options.host);

          server.once('listening', () => {
            bus.emit('listening', server);

            log.info(chalk`Project is running at {blue ${uri}}`);
            clip.writeSync(uri);
            log.info(chalk.grey('Server URI copied to clipboard'));

            if (options.open) {
              open(urljoin(uri, options.open.path || ''), options.open);
            }
          });
        });
    }
  };
};
