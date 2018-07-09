const { readFileSync: read } = require('fs');
const path = require('path');

const request = require('supertest');

const serve = require('../lib/index');

jest.setTimeout(10000);

describe('serve', () => {
  test('serve', () => {
    const argv = { logLevel: 'silent' };
    const opts = {};
    return serve(argv, opts).then(({ app, options }) => {
      expect(app).toMatchSnapshot();
      expect(options).toMatchSnapshot({
        compiler: expect.any(Object),
      });

      return new Promise((resolve) => {
        setTimeout(() => app.stop(resolve), 500);
      });
    });
  });

  test('bad argv', () => {
    const argv = [];
    const opts = {};
    const fn = () => serve(argv, opts);

    expect(fn).toThrowErrorMatchingSnapshot();
  });

  test('no params', () =>
    serve().then(
      ({ app }) =>
        new Promise((resolve) => {
          app.stop(resolve);
        })
    ));

  test('basic config', () => {
    const argv = { logLevel: 'silent' };
    const opts = { config: require('./fixtures/basic/webpack.config') };
    return serve(argv, opts).then(({ app, on, options }) => {
      const { server } = app;
      expect(app).toMatchSnapshot();
      expect(options).toMatchSnapshot({
        compiler: expect.any(Object),
      });

      return new Promise((resolve) => {
        on('build-finished', ({ stats }) => {
          expect(stats).toBeDefined();
          request(server)
            .get('/output.js')
            .expect(200)
            .then((response) => {
              expect(response.text.length).toBeGreaterThan(1000);
              app.stop(resolve);
            });
        });
      });
    });
  });

  test('config + add', () => {
    const argv = { logLevel: 'silent' };
    const opts = {
      add(app, middleware) {
        middleware.webpack().then(() => {
          middleware.content({
            index: 'index.htm',
          });

          app.use((ctx) => {
            // eslint-disable-next-line no-param-reassign
            ctx.status = 204;
          });
        });
      },
      config: require('./fixtures/htm/webpack.config'),
    };

    return serve(argv, opts).then(({ app }) => {
      const req = request(app.server);
      return Promise.all([
        // credit: @frenzzy for this test
        req.get('/fallthrough').expect(204),
        req.get('/index.htm').expect(200),
        req.get('/output.js').expect(200),
      ]).then(() => new Promise((resolve) => app.stop(resolve)));
    });
  });

  test('https', () => {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

    const argv = { logLevel: 'silent' };
    const cert = read(path.resolve(__dirname, './fixtures/test-cert.pem'));
    const key = read(path.resolve(__dirname, './fixtures/test-key.pem'));
    const opts = {
      config: require('./fixtures/multi/webpack.config'),
      https: { cert, key },
    };
    return serve(argv, opts).then(({ app }) => {
      const { port } = app.server.address();
      const req = request(`https://localhost:${port}`);
      return Promise.all([
        req.get('/static/client.js').expect(200),
        req.get('/server/server.js').expect(200),
      ]).then(() => new Promise((resolve) => app.stop(resolve)));
    });
  });

  test('multi config', () => {
    const argv = { logLevel: 'silent' };
    const opts = { config: require('./fixtures/multi/webpack.config') };
    return serve(argv, opts).then(({ app }) => {
      const req = request(app.server);
      return Promise.all([
        req.get('/static/client.js').expect(200),
        req.get('/server/server.js').expect(200),
      ]).then(() => new Promise((resolve) => app.stop(resolve)));
    });
  });

  test('multi-named config', () => {
    const argv = { logLevel: 'silent' };
    const opts = { config: require('./fixtures/multi-named/webpack.config') };
    return serve(argv, opts).then(({ app }) => {
      const req = request(app.server);
      return Promise.all([
        req.get('/bundle1.js').expect(200),
        req.get('/bundle2.js').expect(200),
      ]).then(() => new Promise((resolve) => app.stop(resolve)));
    });
  });

  test('webpack 4 defaults config', () => {
    const argv = { logLevel: 'silent' };
    const opts = {
      config: require('./fixtures/webpack-4-defaults/webpack.config'),
    };
    return serve(argv, opts).then(({ app }) => {
      const req = request(app.server);
      return Promise.all([
        req.get('/index.html').expect(200),
        req.get('/main.js').expect(200),
      ]).then(() => new Promise((resolve) => app.stop(resolve)));
    });
  });
});
