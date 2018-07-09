const { join, resolve } = require('path');

const execa = require('execa');
const request = require('supertest');

const cliPath = resolve(__dirname, '../lib/cli.js');

// eslint-disable-next-line no-unused-vars
const pipe = (proc) => {
  proc.stderr.pipe(process.stdout);
  proc.stdout.pipe(process.stdout);
};

const run = (flags, execaOptions = {}) => {
  const args = [cliPath, flags, execaOptions];
  const reReady = /(Compiled successfully)|(Compiled with warnings)/i;
  const proc = execa(...args);

  // pipe(proc);

  proc.ready = new Promise((resolv) => {
    proc.stdout.on('data', (data) => {
      if (reReady.test(data.toString())) {
        resolv();
      }
    });
  });

  return proc;
};

jest.setTimeout(10000);

describe('cli', () => {
  test('--help', () => {
    const proc = run(['--help']);

    return proc.then(({ stdout }) => {
      expect(stdout).toMatchSnapshot();
    });
  });

  test('--version', () => {
    const proc = run(['--version']);

    return proc.then(({ stdout }) => {
      expect(stdout).toMatch(/\d+\.\d+\.\d+/);
    });
  });

  test('[config]', () => {
    const config = './test/fixtures/basic/webpack.config.js';
    const proc = run([config, '--port', '9090']);

    return proc.ready.then(() =>
      request('http://localhost:9090')
        .get('/output.js')
        .expect(200)
        .then(() => proc.kill('SIGINT'))
    );
  });

  test('--config', () => {
    const config = './test/fixtures/basic/webpack.config.js';
    const proc = run(['--config', config, '--port', '8888']);

    return proc.ready.then(() =>
      request('http://localhost:8888')
        .get('/output.js')
        .expect(200)
        .then(() => proc.kill('SIGINT'))
    );
  });

  test('bad config', () => {
    const config = './test/fixtures/invalid.config.js';
    const proc = run([config]);

    return proc.catch((e) => {
      const message = e.message
        .split(/\n\s+at/)[0]
        .replace(
          /\(node:\d+\) ExperimentalWarning: The fs.promises API is experimental\n/,
          ''
        );
      expect(message).toMatchSnapshot();
      expect(proc.exitCode).toBe(1);
    });
  });

  test('config throwing error', () => {
    const config = './test/fixtures/error.config.js';
    const proc = run([config]);

    return proc.catch((e) => {
      const message = e.message.split(/\n\s+at/);
      expect(message[0]).toMatchSnapshot();
      expect(proc.exitCode).toBe(1);
    });
  });

  test('serve.config.js', () => {
    const config = './basic/webpack.config.js';
    const cwd = join(__dirname, 'fixtures');
    const proc = run([config], { cwd });

    return proc.ready.then(() =>
      request('http://0.0.0.0:8080')
        .get('/output.js')
        .expect(200)
        .then(() => proc.kill('SIGINT'))
    );
  });
});
