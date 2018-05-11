/* eslint no-console: off */

console.log('page module');

if (typeof module.hot === 'object') {
  module.hot.accept((err) => {
    if (err) {
      console.error('Cannot apply HMR update.', err);
    }
  });
}
