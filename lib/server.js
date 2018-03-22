'use strict';

const http = require('http');
const https = require('https');
const chalk = require('chalk');
const clip = require('clipboardy');
const getPort = require('get-port');
const killable = require('killable');
const Koa = require('koa');
const koaWebpack = require('koa-webpack');
const serveStatic = require('@shellscape/koa-static/legacy');
const urljoin = require('url-join');
const weblog = require('webpack-log');
const WebpackServeError = require('./WebpackServeError');

module.exports = (options) => {
  const app = new Koa();
  const { bus } = options;
  const log = weblog({ name: 'serve', id: 'webpack-serve' });
  let http2;
  let server;
  let koaMiddleware;

  const middleware = {
    webpack: () => {
      middleware.webpack.called = true;

      // track the promise state in the event that someone calls server.close()
      // quickly, before this promise resolves.

      try {
        koaMiddleware = koaWebpack({
          // be explicit about what we want to pass, rather than passing the entire
          // options object
          compiler: options.compiler,
          dev: options.dev,
          hot: options.hot
        });
        app.use(koaMiddleware);
        middleware.webpack.state = Promise.resolve();
      } catch (e) {
        middleware.webpack.state = Promise.reject(e);
        throw new WebpackServeError(`An error was thrown while initializing koa-webpack\n ${e.toString()}`);
      }
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
        if (middleware.webpack.called) {
          middleware.webpack.state.then(() => koaMiddleware.close(callback));
        }
      });
    },
    start() {
      if (typeof options.add === 'function') {
        options.add(app, middleware, options);
      }

      if (!middleware.content.called) {
        middleware.content();
      }

      server.once('listening', () => {
        const uri = `${options.protocol}://${options.host}:${options.port}`;

        log.info(chalk`Project is running at {blue ${uri}}`);

        if (options.clipboard && !options.open) {
          try {
            clip.writeSync(uri);
            log.info(chalk.grey('Server URI copied to clipboard'));
          } catch (error) {
            log.warn(chalk.grey('Failed to copy server URI to clipboard. ' +
                'Use logLevel: \'debug\' for more information.'));
            log.debug(error);
          }
        }

        bus.emit('listening', server);

        if (options.open) {
          const open = require('opn'); // eslint-disable-line global-require
          open(urljoin(uri, options.open.path || ''), options.open.app || {});
        }
      });

      return Promise.all([
        getPort({ port: options.port, host: options.host }),
        getPort({ port: options.hot.port || 8081, host: options.host })
      ])
        .then(([port, hotPort]) => {
          options.port = port;
          if (options.hot) {
            options.hot.port = hotPort;
          }

          // allow consumers to specifically order middleware
          if (!middleware.webpack.called) {
            middleware.webpack();
          }

          server.listen(options.port, options.host);

          return server;
        });
    }
  };
};
