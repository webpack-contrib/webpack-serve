<div align="center">
  <a href="https://github.com/webpack/webpack">
    <img width="200" height="200" src="https://webpack.js.org/assets/icon-square-big.svg">
  </a>
</div>

[![npm][npm]][npm-url]
[![node][node]][node-url]
[![deps][deps]][deps-url]
[![tests][tests]][tests-url]
[![coverage][cover]][cover-url]
[![chat][chat]][chat-url]

# webpack-serve

A lean, modern, and flexible webpack development server

## Browser Support

Because this module leverages _native_ `WebSockets` via `webpack-hot-client`,
the browser support for this module is limited to only those browsers which
support native `WebSocket`. That typically means the last two major versions
of a particular browser. You may view a table of
[compatible browsers here](https://caniuse.com/#feat=websockets).

_Note: We won't be accepting requests for changes to this facet of the module._

## Getting Started

To begin, you'll need to install `webpack-serve`:

```console
$ npm install webpack-serve --save-dev
```

_Note: This module is still green and should be considered unstable._

## CLI

```console
$ webpack-serve --help

  Options
    --config            The webpack config to serve. Alias for <config>.
    --content           The path from which content will be served
    --dev               An object containing options for webpack-dev-middleware
    --help              Show usage information and the options listed here.
    --host              The host the app should bind to
    --http2             Instruct the server to use HTTP2
    --https-cert        Specify a cert to enable https. Must be paired with a key
    --https-key         Specify a key to enable https. Must be paired with a cert
    --https-pass        Specify a passphrase to enable https. Must be paired with a pfx file
    --https-pfx         Specify a pfx file to enable https. Must be paired with a passphrase
    --log-level         Limit all process console messages to a specific level and above
                        {dim Levels: trace, debug, info, warn, error, silent}
    --log-time          Instruct the logger for webpack-serve and dependencies to display a timestamp
    --no-hot            Instruct the client not to apply Hot Module Replacement patches
    --no-reload         Instruct middleware {italic not} to reload the page for build errors
    --open              Instruct the app to open in the default browser
    --open-app          The name of the app to open the app within
    --open-path         The path with the app a browser should open to
    --port              The port the app should listen on
    --version           Display the webpack-serve version

  Examples
    $ webpack-serve ./webpack.config.js --no-reload
    $ webpack-serve --config ./webpack.config.js --port 1337
    $ webpack-serve --port 1337  # config can be omitted for webpack v4+ only
```

_Note: The CLI will use your local install of webpack-serve when available,
even when run globally._

### Running the CLI

There are a few variations for using the base CLI command, and starting
`webpack-serve`:

```console
  $ webpack-serve ./webpack.config.js
  $ webpack-serve --config ./webpack.config.js
```

Those two commands are synonymous. Both instruct `webpack-serve` to load the
config from the specified path. We left the flag in there because some folks
like to be verbose, so why not.

```console
  $ webpack-serve
```

And for the folks using webpack v4 or higher, you can instruct `webpack-serve` to
kick off a webpack build without specifying a config. Keep in mind that this will
apply the default config within webpack, and your project must conform to that
for a successful build to happen.

When running `$ webpack-serve` without arguments in webpack v3 and lower, the CLI
will display help and usage information. In order to accommodate the zero-config
changes in webpack v4, users of webpack v4 will need to use the `--help` flag to
display the same information.

## Webpack Config `serve` Property

`webpack-serve` supports the `serve` property in your webpack config file, which
may contain any of the supported [options](#Options).

## API

When using the API directly, the main entry point  is the `serve` function, which
is the default export of the module.

```js
const serve = require('webpack-serve');
const config = require('./webpack.config.js');

serve({ config });
```

### serve([options])

Returns an `Object` containing:

- `close()` *(Function)* - Closes the server and its dependencies.
- `on(eventName, fn)` *(Function)* - Binds a serve event to a function. See
[Events](#events).

#### options

Type: `Object`

Options for initializing and controlling the server provided.

##### compiler

Type: `webpack`  
Default: `null`

An instance of a `webpack` compiler. A passed compiler's config will take
precedence over `config` passed in options.

_Note: Any `serve` configuration must be removed from the webpack config used
to create the compiler instance, before you attempt to create it, as it's not
a valid webpack config property._

##### config

Type: `Object`  
Default: `{}`

An object containing the configuration for creating a new `webpack` compiler
instance.

##### content

Type: `String|[String]`  
Default: `[]`

The path, or array of paths, from which content will be served.

##### dev

Type: `Object`  
Default: `{ publicPath: '/' }`

An object containing options for [webpack-dev-middleware][dev-ware].

##### host

Type: `Object`  
Default: `'localhost'`

Sets the host that the `WebSocket` server will listen on. If this doesn't match
the host of the server the module is used with, the module will not function
properly.

##### hot

Type: `Object`  
Default: `{}`

An object containing options for [webpack-hot-client][hot-client].

##### http2

Type: `Boolean`  
Default: `false`

If using Node v9 or greater, setting this option to `true` will enable HTTP2
support.

##### https

Type: `Object`  
Default: `null`

Passing this option will instruct `webpack-serve` to create and serve the webpack
bundle and accompanying content through a secure server. The object should
contain properties matching:

```js
{
  key: fs.readFileSync('...key'),   // Private keys in PEM format.
  cert: fs.readFileSync('...cert'), // Cert chains in PEM format.
  pfx: <String>,                    // PFX or PKCS12 encoded private key and certificate chain.
  passphrase: <String>              // A shared passphrase used for a single private key and/or a PFX.
}
```

See the [Node documentation][https-opts] for more information.

##### logLevel

Type: `String`  
Default: `info`

Instructs `webpack-serve` to output information to the console/terminal at levels
higher than the specified level. Valid levels:

```js
[
  'trace',
  'debug',
  'info',
  'warn',
  'error'
]
```

##### logTime

Type: `Boolean`  
Default: `false`

Instruct `webpack-serve` to prepend each line of log output with a `[HH:mm:ss]`
timestamp.

##### open

Type: `Boolean|Object`  
Default: `false`

Instruct the module to open the served bundle in a browser. Accepts an `Object`
that matches:

```js
{
  app: <String>, // The proper name of the browser app to open.
  path: <String> // The url path on the server to open.
}
```

##### port

Type: `Number`  
Default: `8080`

The port the server should listen on.

## Events

`webpack-serve` emits select events which can be subscribed to. For example;

```js
const serve = require('webpack-serve');
const config = require('./webpack.config.js');

serve({ config });

serve.on('listening', () => {
  console.log('happy fun time');
});
```

#### listening

Arguments: _None_

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

## Contributing

We welcome your contributions! Please have a read of
[CONTRIBUTING.md](CONTRIBUTING.md) for more information on how to get involved.

## License

#### [MIT](./LICENSE)

[npm]: https://img.shields.io/npm/v/webpack-serve.svg
[npm-url]: https://npmjs.com/package/webpack-serve

[node]: https://img.shields.io/node/v/webpack-serve.svg
[node-url]: https://nodejs.org

[deps]: https://david-dm.org/webpack-contrib/webpack-serve.svg
[deps-url]: https://david-dm.org/webpack-contrib/webpack-serve

[tests]: 	https://img.shields.io/circleci/project/github/webpack-contrib/webpack-serve.svg
[tests-url]: https://circleci.com/gh/webpack-contrib/webpack-serve/tree/master

[cover]: https://codecov.io/gh/webpack-contrib/webpack-serve/branch/master/graph/badge.svg
[cover-url]: https://codecov.io/gh/webpack-contrib/webpack-serve

[chat]: https://badges.gitter.im/webpack/webpack.svg
[chat-url]: https://gitter.im/webpack/webpack

[dev-ware]: https://github.com/webpack/webpack-dev-middleware#options
[hot-client]: https://github.com/webpack-contrib/webpack-hot-client#options
[https-opts]: https://nodejs.org/api/tls.html#tls_tls_createsecurecontext_options