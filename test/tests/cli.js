'use strict';

const path = require('path');
const assert = require('power-assert');
const execa = require('execa');
const fetch = require('node-fetch');

const cliPath = path.resolve(__dirname, '../../cli.js');
const configPath = path.resolve(__dirname, '../fixtures/basic/webpack.config-silent.js');

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
    }, 500);
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
    }, 500);
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
    }, 500);
  });


  it('should use the --content flag');
  it('should use the --dev flag');
  it('should use the --host flag');
  it('should use the --hot flag');
  it('should use the --http2 flag');
  it('should use the --https-cert flag');
  it('should use the --https-key flag');
  it('should use the --https-pass flag');
  it('should use the --https-pfx flag');
  it('should use the --log-level flag');
  it('should use the --log-time flag');
  it('should use the --no-reload flag');
  it('should use the --open flag');
  it('should use the --open-app flag');
  it('should use the --open-path flag');
  it('should use the --port flag');
  it('should use the --stdin-end-exit flag');
});
