const http = require('http');
const https = require('https');
const net = require('net');
const tls = require('tls');
const { readFileSync: read } = require('fs');
const { resolve } = require('path');

const nodeVersion = require('node-version');

const mockClip = {
  throw: false,
  writeSync: jest.fn(() => {
    if (mockClip.throw) {
      throw new Error('mock clipboard error');
    }
  }),
};
const mockOpn = jest.fn(() => {});
const mockWeblog = {
  debug: jest.fn(() => {}),
  info: jest.fn(() => {}),
  warn: jest.fn(() => {}),
};

jest.mock('clipboardy', () => mockClip);
jest.mock('opn', () => mockOpn);
jest.mock('webpack-log', () => () => mockWeblog);

const { bind, getServer } = require('../lib/server');
const eventbus = require('../lib/bus');

const bus = eventbus({});

describe('server', () => {
  test('getServer', () => {
    const app = {
      callback() {},
    };
    const options = {};
    const server = getServer(app, options);
    expect(server).toBeInstanceOf(net.Server);
    expect(server).toBeInstanceOf(http.Server);
    expect(server.constructor.name).toMatchSnapshot();
  });

  if (nodeVersion.major > 6) {
    test('getServer http2', () => {
      const app = {
        callback() {},
      };

      const options = { http2: true };
      const server = getServer(app, options);
      expect(server).toBeInstanceOf(net.Server);
      // Http2Server is apparently not exported https://github.com/nodejs/node/issues/21434
      // expect(server).toBeInstanceOf(http2.Server);
      expect(server.constructor.name).toMatchSnapshot();
    });

    test('getServer http2+https: cert/key', () => {
      const app = {
        callback() {},
      };
      const cert = read(resolve(__dirname, './fixtures/test-cert.pem'));
      const key = read(resolve(__dirname, './fixtures/test-key.pem'));
      const options = { http2: true, https: { cert, key } };
      const server = getServer(app, options);
      expect(server).toBeInstanceOf(tls.Server);
      // Http2SecureServer is apparently not exported https://github.com/nodejs/node/issues/21434
      // expect(server).toBeInstanceOf(http2.Http2SecureServer);
      expect(server.constructor.name).toMatchSnapshot();
    });
  } else {
    test.skip('getServer http2', () => {});
    test.skip('getServer http2+https: cert/key', () => {});
  }

  test('getServer https: cert/key', () => {
    const app = {
      callback() {},
    };
    const cert = read(resolve(__dirname, './fixtures/test-cert.pem'));
    const key = read(resolve(__dirname, './fixtures/test-key.pem'));
    const options = { https: { cert, key } };
    const server = getServer(app, options);

    expect(server).toBeInstanceOf(tls.Server);
    expect(server).toBeInstanceOf(https.Server);
    expect(server.constructor.name).toMatchSnapshot();
  });

  test('getServer https: pass/pfx', () => {
    const app = {
      callback() {},
    };
    const passphrase = 'sample';
    const pfx = read(resolve(__dirname, './fixtures/test-cert.pfx'));
    const options = {
      https: { passphrase, pfx },
    };
    const server = getServer(app, options);
    expect(server).toBeInstanceOf(tls.Server);
    expect(server).toBeInstanceOf(https.Server);
    expect(server.constructor.name).toMatchSnapshot();
  });

  test('bind', () => {
    const app = {
      callback() {},
    };
    const options = {
      bus,
      clipboard: true,
      host: 'localhost',
      protocol: 'https',
    };
    const server = getServer(app, options);

    bind(server, options);

    return new Promise((reslve) => {
      server.listen(0, 'localhost', () => {
        expect(mockClip.writeSync.mock.calls.length).toBe(1);
        setTimeout(() => server.kill(reslve), 500);
      });
    });
  });

  // Node 6 + Jest has a really hard time with ansi color codes and I'm
  // just not going to deal with it anymore
  if (nodeVersion.major > 6) {
    test('bind clipboard error', () => {
      mockClip.throw = true;
      const app = {
        callback() {},
      };
      const options = {
        bus,
        clipboard: true,
        host: 'localhost',
        protocol: 'https',
      };
      const server = getServer(app, options);

      bind(server, options);

      return new Promise((reslve) => {
        server.listen(0, 'localhost', () => {
          expect(mockWeblog.debug.mock.calls.length).toBe(1);
          expect(mockWeblog.debug.mock.calls).toMatchSnapshot();
          expect(mockWeblog.warn.mock.calls.length).toBe(1);
          expect(mockWeblog.warn.mock.calls).toMatchSnapshot();
          setTimeout(() => server.kill(reslve), 500);
        });
      });
    });
  } else {
    test.skip('bind clipboard error', () => {});
  }

  test('bind open', () => {
    const app = {
      callback() {},
    };
    const options = {
      bus,
      open: true,
      host: 'localhost',
      protocol: 'https',
    };
    const server = getServer(app, options);

    bind(server, options);
    server.listen(0, 'localhost');

    return new Promise((reslve) => {
      server.listen(0, 'localhost', () => {
        expect(mockOpn.mock.calls.length).toBe(1);
        setTimeout(() => server.kill(reslve), 500);
      });
    });
  });
});
