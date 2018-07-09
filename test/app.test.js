const http = require('http');
const net = require('net');

const weblog = require('webpack-log');

const { getApp } = require('../lib/app');
const eventbus = require('../lib/bus');
const { getCompiler } = require('../lib/compiler');
const { getOptions } = require('../lib/options');

/* eslint-disable no-param-reassign */

describe('app', () => {
  weblog({
    id: 'webpack-serve',
    level: 'silent',
    name: 'serve',
  });

  test('getApp', () => {
    const config = require('./fixtures/basic/webpack.config');
    const content = ['./batman', './superman'];
    const logLevel = 'silent';
    const options = {
      bus: eventbus({}),
      content,
      devMiddleware: { publicPath: '/', logLevel },
      hotClient: { logLevel },
      host: 'localhost',
      port: 0,
      protocol: 'http',
    };
    options.compiler = getCompiler([config], options);
    const app = getApp(options);

    expect(app).toMatchSnapshot();

    return app.start().then(([, , server]) => {
      expect(server).toBeInstanceOf(net.Server);
      expect(server).toBeInstanceOf(http.Server);
      expect(server.constructor.name).toMatchSnapshot();
      return new Promise((resolve) => {
        setTimeout(() => app.stop(resolve), 500);
      });
    });
  });

  test('getApp + getOptions', () => {
    const argv = {
      config: './test/fixtures/basic/webpack.config.js',
      logLevel: 'silent',
    };
    const opts = {};

    return getOptions(argv, opts).then((result) => {
      const { configs, options } = result;

      expect(configs).toMatchSnapshot();
      expect(options).toMatchSnapshot();

      options.bus = eventbus({});
      options.compiler = getCompiler(configs, options);
      const app = getApp(options);

      return app.start().then(([, , server]) => {
        expect(server).toBeInstanceOf(net.Server);
        expect(server).toBeInstanceOf(http.Server);
        expect(server.constructor.name).toMatchSnapshot();
        return new Promise((resolve) => {
          setTimeout(() => app.stop(resolve), 500);
        });
      });
    });
  });
});
