'use strict';

const execSync = require('child_process').execSync;
const port = 8080;

module.exports = {
  entry: {
    index: [path.resolve(__dirname, 'app.js')],
  },
  mode: 'development',
  output: {
    filename: 'output.js',
  },
};

module.exports.serve = {
  port,
  on: {
    listening: () => {
      execSync('ps cax | grep "Google Chrome"');
      execSync(
        `osascript openChrome.applescript "${encodeURI(
          `http://localhost:${port}`
        )}"`,
        {
          cwd: __dirname,
          stdio: 'ignore',
        }
      );
    },
  },
};
