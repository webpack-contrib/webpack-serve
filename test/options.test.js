const { readFileSync: read } = require('fs');
const { resolve } = require('path');

const { apply, getOptions } = require('../lib/options');

const argv = {};

describe('options', () => {
  test('defaults', () => {
    const configs = [{}];
    const opts = {};
    const result = apply(argv, configs, opts);
    expect(result).toMatchSnapshot();
  });

  test('content: String', () => {
    const configs = [{}];
    const opts = {
      content: '/batmans/costume',
    };
    const result = apply(argv, configs, opts);
    expect(result).toMatchSnapshot();
  });

  test('config content', () => {
    const configs = [
      {
        context: '/batmans/costume',
      },
    ];
    const opts = {};
    const result = apply(argv, configs, opts);
    expect(result).toMatchSnapshot();
  });

  test('hotClient: true, for the silly people', () => {
    const configs = [{}];
    const opts = {
      hotClient: true,
    };
    const result = apply(argv, configs, opts);
    expect(result).toMatchSnapshot();
  });

  test('missing hotClient.host', () => {
    const configs = [{}];
    const opts = {
      hotClient: {},
    };
    const result = apply(argv, configs, opts);
    expect(result).toMatchSnapshot();
  });

  test('apply https cert/key', () => {
    const configs = [{}];
    const cert = resolve(__dirname, './fixtures/test-cert.pem');
    const key = resolve(__dirname, './fixtures/test-key.pem');
    const opts = { https: { cert, key } };
    const result = apply(argv, configs, opts);
    expect(result).toMatchSnapshot();
  });

  test('apply https pass/pfx', () => {
    const configs = [{}];
    const passphrase = 'sample';
    const pfx = resolve(__dirname, './fixtures/test-cert.pfx');
    const opts = { https: { passphrase, pfx } };
    const result = apply(argv, configs, opts);
    expect(result).toMatchSnapshot();
  });

  test('apply https cert/key buffer', () => {
    const configs = [{}];
    const cert = read(resolve(__dirname, './fixtures/test-cert.pem'));
    const key = read(resolve(__dirname, './fixtures/test-key.pem'));
    const opts = { https: { cert, key } };
    const result = apply(argv, configs, opts);
    expect(result).toMatchSnapshot();
  });

  test('apply https pass/pfx buffer', () => {
    const configs = [{}];
    const passphrase = 'sample';
    const pfx = read(resolve(__dirname, './fixtures/test-cert.pfx'));
    const opts = { https: { passphrase, pfx } };
    const result = apply(argv, configs, opts);
    expect(result).toMatchSnapshot();
  });

  test('compensate for shorthand passphrase', () => {
    const configs = [{}];
    const pass = 'sample';
    const pfx = read(resolve(__dirname, './fixtures/test-cert.pfx'));
    const opts = { https: { pass, pfx } };
    const result = apply(argv, configs, opts);
    expect(result).toMatchSnapshot();
  });

  test('getOptions', () => {
    const opts = {};
    getOptions(argv, opts).then((result) => {
      expect(result).toMatchSnapshot();
    });
  });
});
