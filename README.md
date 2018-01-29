# webpack-serve

A lean, modern, and flexible webpack development server

## CLI

```console
$ webpack-serve --help

  Options
    --content           The path from which content will be served
    --dev               An object containing options for webpack-dev-middleware
    --host              The host the app should bind to
    --hot               An object containing options for webpack-hot-client
    --http2             Instruct the server to use HTTP2
    --https-cert        Specify a cert to enable https. Must be paired with a key
    --https-key         Specify a key to enable https. Must be paired with a cert
    --https-pass        Specify a passphrase to enable https. Must be paired with a pfx file
    --https-pfx         Specify a pfx file to enable https. Must be paired with a passphrase
    --log-level         Limit console messages to a specific level and above
                        Levels: trace, debug, info, warn, error, silent
    --log-time          Instruct the logger to display a timestamp
    --no-reload         Instruct middleware not to reload the page for build errors
    --open              Instruct the app to open in the default browser
    --open-wrapped      The name of the app to open the app within
    --open-path         The path with the app a browser should open to
    --port              The port the app should listen on
    --stdin-end-exit    End the webpack-serve process when stdin ends. Useful in container
                        environments.
    --version           Display the webpack-serve version

  Examples
    $ webpack-serve ./webpack.config.js --no-reload
```

_Note: The CLI will use your local install of webpack-serve when available,
even when run globally._

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
