const { resolve } = require('path');

const { apply } = require('../lib/flags');

describe('flags', () => {
  test('apply defaults', () => {
    const argv = {};
    expect(apply(argv)).toMatchSnapshot();
  });

  test('apply devWare', () => {
    const argv = { devWare: { publicPath: '/static' } };
    expect(apply(argv)).toMatchSnapshot();
  });

  test('apply hotClient', () => {
    const argv = { hotClient: { hmr: false, reload: false } };
    expect(apply(argv)).toMatchSnapshot();
  });

  test('apply hotClient false', () => {
    const argv = { hotClient: false };
    expect(apply(argv)).toMatchSnapshot();
  });

  test('apply hmr false', () => {
    const argv = { hmr: false };
    expect(apply(argv)).toMatchSnapshot();
  });

  test('apply https cert/key', () => {
    const httpsCert = resolve(__dirname, './fixtures/test-cert.pem');
    const httpsKey = resolve(__dirname, './fixtures/test-key.pem');
    const argv = { httpsCert, httpsKey };
    expect(apply(argv)).toMatchSnapshot();
  });

  test('apply https pass/pfx', () => {
    const httpsPass = 'sample';
    const httpsPfx = resolve(__dirname, './fixtures/test-cert.pfx');
    const argv = { httpsPass, httpsPfx };
    expect(apply(argv)).toMatchSnapshot();
  });

  test('apply logLevel', () => {
    const argv = { logLevel: 'silent' };
    expect(apply(argv)).toMatchSnapshot();
  });

  test('apply logTime', () => {
    const argv = { logTime: true };
    expect(apply(argv)).toMatchSnapshot();
  });

  test('apply open', () => {
    const argv = { openApp: 'app', openPath: 'path' };
    expect(apply(argv)).toMatchSnapshot();
  });

  test('apply open boolean', () => {
    const argv = { open: true };
    expect(apply(argv)).toMatchSnapshot();
  });

  test('apply port string', () => {
    const argv = { port: '8888' };
    expect(apply(argv)).toMatchSnapshot();
  });

  test('apply port number', () => {
    const argv = { port: 8888 };
    expect(apply(argv)).toMatchSnapshot();
  });

  test('apply reload false', () => {
    const argv = { reload: false };
    expect(apply(argv)).toMatchSnapshot();
  });

  test('compound logTime/logLevel', () => {
    const argv = { logLevel: 'warn', logTime: true };
    expect(apply(argv)).toMatchSnapshot();
  });

  test('compound devMiddleware value', () => {
    const argv = { devWare: { batman: 'robin' }, logTime: true };
    expect(apply(argv)).toMatchSnapshot();
  });

  test('compound hotClient value', () => {
    const argv = { hotClient: { hmr: false }, logTime: true };
    expect(apply(argv)).toMatchSnapshot();
  });

  test('compound hotClient: false value', () => {
    const argv = { hotClient: false, logTime: true };
    expect(apply(argv)).toMatchSnapshot();
  });
});
