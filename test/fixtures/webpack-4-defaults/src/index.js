'use strict';

/* eslint no-console: off */

// require('./component');

if (typeof module.hot === 'object') {
  module.hot.accept((err) => {
    if (err) {
      console.error('Cannot apply HMR update.', err);
    }
  });
}
