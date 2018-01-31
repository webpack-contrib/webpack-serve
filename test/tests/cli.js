'use strict';

const path = require('path');
const assert = require('power-assert');
const execa = require('execa');
const fetch = require('node-fetch');

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
  it('should use the --log-level flag');
  it('should use the --log-time flag');

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

  it('should use the --stdin-end-exit flag');

  // will need testing in browser
  it('should use the --no-hot flag');
  it('should use the --no-reload flag');

  // need to devise a way to trap calls to opn
  it('should use the --open flag');
  it('should use the --open-app flag');
  it('should use the --open-path flag');
});
