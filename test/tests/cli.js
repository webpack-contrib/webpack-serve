'use strict';

const path = require('path');
const assert = require('power-assert');
const execa = require('execa');
const fetch = require('node-fetch');
const strip = require('strip-ansi');

const cliPath = path.resolve(__dirname, '../../cli.js');
const configPath = path.resolve(__dirname, '../fixtures/basic/webpack.config.js');

function pipe(proc) { // eslint-disable-line no-unused-vars
  const stream = proc.stdout;
  stream.pipe(process.stdout);
}

describe('webpack-serve CLI', () => {
  it('should run webpack-serve [config]', (done) => {
    const proc = execa(cliPath, [configPath]);

    setTimeout(() => {
      fetch('http://localhost:8080')
        .then((res) => {
          assert(res.ok);
          proc.kill('SIGINT');
          done();
        });
    }, 1e3);
  });

  it('should run webpack-serve --config', (done) => {
    const proc = execa(cliPath, ['--config', configPath]);

    setTimeout(() => {
      fetch('http://localhost:8080')
        .then((res) => {
          assert(res.ok);
          proc.kill('SIGINT');
          done();
        });
    }, 1e3);
  });

  it('should run webpack-serve and find the config', (done) => {
    const proc = execa(cliPath, { cwd: path.resolve(__dirname, '../fixtures/basic') });

    setTimeout(() => {
      fetch('http://localhost:8080')
        .then((res) => {
          assert(res.ok);
          proc.kill('SIGINT');
          done();
        });
    }, 1e3);
  });

  it('should use the --content flag', (done) => {
    const confPath = path.resolve(__dirname, '../fixtures/webpack.config.js');
    const contentPath = path.join(__dirname, '../fixtures/content');
    const proc = execa(cliPath, ['--config', confPath, '--content', contentPath]);

    setTimeout(() => {
      fetch('http://localhost:8080')
        .then((res) => {
          assert(res.ok);
          proc.kill('SIGINT');
          done();
        });
    }, 1e3);
  });

  it('should use the --host flag', (done) => {
    const proc = execa(cliPath, ['--config', configPath, '--host', '0.0.0.0']);

    setTimeout(() => {
      fetch('http://0.0.0.0:8080')
        .then((res) => {
          assert(res.ok);
          proc.kill('SIGINT');
          done();
        });
    }, 1e3);
  });

  // need to get devcert documentation going and then write tests
  // for the http2 test: https://nodejs.org/api/http2.html#http2_client_side_example
  it('should use the --http2 flag');
  it('should use the --https-cert flag');
  it('should use the --https-key flag');
  it('should use the --https-pass flag');
  it('should use the --https-pfx flag');

  // inspect output from the proc
  it('should silence only webpack-serve with the --log-level flag', (done) => {
    const proc = execa(cliPath, ['--config', configPath, '--log-level', 'silent']);

    proc.then((result) => {
      const lines = result.stdout.split('\n')
        .map(l => strip(l))
        .filter(line => line.indexOf('｢serve｣') > 0);

      assert.equal(lines.length, 0);

      done();
    });

    setTimeout(() => {
      proc.kill('SIGINT');
    }, 1e3);
  });

  it('should use the --log-time flag', (done) => {
    const proc = execa(cliPath, ['--config', configPath, '--log-time']);

    proc.then((result) => {
      const lines = result.stdout.split('\n')
        .map(l => strip(l))
        .filter(l => l.indexOf('｢serve｣') > 0);

      assert(lines.length > 0);

      for (const line of lines) {
        assert(/^\[[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2}\]/.test(line));
      }

      done();
    });

    setTimeout(() => {
      proc.kill('SIGINT');
    }, 1e3);
  });

  it('should use the --port flag', (done) => {
    const proc = execa(cliPath, ['--config', configPath, '--port', 1337]);

    setTimeout(() => {
      fetch('http://localhost:1337')
        .then((res) => {
          assert(res.ok);
          proc.kill('SIGINT');
          done();
        });
    }, 1e3);
  });

  // will need testing in browser
  it('should use the --no-hot flag');
  it('should use the --no-reload flag');

  // haven't come up with a good way to automate testing this
  // it('should use the --open flag');
  // it('should use the --open-app flag');
  // it('should use the --open-path flag');
});
