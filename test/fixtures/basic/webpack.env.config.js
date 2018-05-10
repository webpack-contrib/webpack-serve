if (process.env.PRELOADED !== true) {
  throw new Error('Failed to preload the environment file');
}

module.exports = require('./webpack.config.js');
