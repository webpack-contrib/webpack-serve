# webpack-serve

A lean, modern, and flexible webpack development server

## Add-on Features

A core tenant of `webpack-serve` is to stay lean in terms of feature set, and to
empower users with familiar and easily portable patterns to implement the same
features that those familiar with `webpack-dev-server` have come to rely on. This
makes the module far easier to maintain, which ultimately benefits the user.

Luckily, flexibility baked into `webpack-serve` makes it a snap to add-on features.
Listed below are some of the add-on patterns that can be found in
[docs/addons](docs/addons):

- [bonjour](docs/addons/bonjour.config.js)
- [compress](docs/addons/compress)
- [historyApiFallback](docs/addons/history-fallback.config.js)
- [proxy](docs/addons/proxy.config.js)
- [staticOptions](docs/addons/static-content-options.config.js)
- [useLocalIp](docs/addons/local-ip.config.js)
