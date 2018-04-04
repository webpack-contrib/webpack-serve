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
    --dev               A JSON object containing options for webpack-dev-middleware
    --help              Show usage information and the options listed here.
    --host              The host the app should bind to
    --hot               A JSON object containing options for webpack-hot-client
    --http2             Instruct the server to use HTTP2
    --https-cert        Specify a cert to enable https. Must be paired with a key
    --https-key         Specify a key to enable https. Must be paired with a cert
    --https-pass        Specify a passphrase to enable https. Must be paired with a pfx file
    --https-pfx         Specify a pfx file to enable https. Must be paired with a passphrase
    --log-level         Limit all process console messages to a specific level and above
                        {dim Levels: trace, debug, info, warn, error, silent}
    --log-time          Instruct the logger for webpack-serve and dependencies to display a timestamp
    --no-clipboard      Instructs the server not to copy the server URI to the clipboard when starting
    --no-hot            Instruct the client not to apply Hot Module Replacement patches
    --no-reload         Instruct middleware {italic not} to reload the page for build errors
    --open              Instruct the app to open in the default browser
    --open-app          The name of the app to open the app within, or an array
                        containing the app name and arguments for the app
    --open-path         The path with the app a browser should open to
    --port              The port the app should listen on
    --require, -r       Preload one or more modules before loading the webpack configuration
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

## `webpack-serve` Config

You can store and define configuration / options for `webpack-serve` in a number
of different ways. This module leverages [cosmiconfig](https://github.com/davidtheclark/cosmiconfig),
which allows you to define `webpack-serve` options in the following ways:

- in your package.json file in a `serve` property
- in a `.serverc` or `.serverc.json` file, in either JSON or YML.
- in a `serve.config.js` file which exports a CommonJS module (just like webpack).

It's most common to keep `serve` options in your `webpack.config.js` (see below),
however, you can utilize any of the options above _in tandem_ with
`webpack.config.js`, and the options from the two sources will be merged. This
can be useful for setups with multiple configs that share common options for
`webpack-serve`, but require subtle differences.

### Webpack Config `serve` Property

`webpack-serve` supports the `serve` property in your webpack config file, which
may contain any of the supported [options](#options).

## Webpack `function()` Configs

Due to some special preprocessing that is part of `webpack-cli`, and not `webpack`
proper, `webpack-serve` cannot fully support configs that export a function without
creating a bit of a mess. We're working on a solution for this, but for the
moment we don't recommend using `webpack-serve` with configs that export a
`function()`. If you must use this type of config, we recommend stubbing the
values you'll need for a development environment.

## API

When using the API directly, the main entry point  is the `serve` function, which
is the default export of the module.

```js
const serve = require('webpack-serve');
const config = require('./webpack.config.js');

serve({ config });
```

### serve([options])

Returns [a `Promise` which resolves] an `Object` containing:

- `close()` *(Function)* - Closes the server and its dependencies.
- `on(eventName, fn)` *(Function)* - Binds a serve event to a function. See
[Events](#events).

#### options

Type: `Object`

Options for initializing and controlling the server provided.

##### add

Please see [Add-On Features](#add-on-features).

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

<!-- intentionally out of alphabetic order -->
##### clipboard

Type: `Boolean`  
Default: `true`

If true, the server will copy the server URI to the clipboard when the server is
started.

##### dev

Type: `Object`  
Default: `{ publicPath: '/' }`

An object containing options for [webpack-dev-middleware][dev-ware].

##### host

Type: `String`  
Default: `'localhost'`

Sets the host that the server will listen on. eg. `'10.10.10.1'`

_Note: This value must match any value specified for `hot.host` or
`hot.host.server`, otherwise `webpack-serve` will throw an error. This
requirement ensures that the `koa` server and `WebSocket` server play nice
together._

##### hot

Type: `Object|Boolean`  
Default: `{}`

An object containing options for [webpack-hot-client][hot-client].  

As of `v0.2.1` setting this to `false` will completely disable `webpack-hot-client`
and all automatic Hot Module Replacement functionality. This is akin to the
`--no-hot-client` CLI flag.

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

##### on

Type: `Object`  
Default: `null`

While running `webpack-serve` from the command line, it can sometimes be useful
to subscribe to events from the module's event bus _within your config_. This
option can be used for that purpose. The option's value must be an `Object`
matching a `key:handler`, `String: Function` pattern. eg:

```js
on: {
  'listening': () => { console.log('listening'); }
}
```

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

_Note: Using the `open` option will disable the `clipboard` option._

##### port

Type: `Number`  
Default: `8080`

The port the server should listen on.

## Events

The server created by `webpack-serve` emits select events which can be subscribed to. For example;

```js
const serve = require('webpack-serve');
const config = require('./webpack.config.js');

serve({ config }).then((server) => {
  server.on('listening', () => {
    console.log('happy fun time');
  });
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
You can leverage this by using the `add` option. The value of the option should
be a `Function` matching the following signature:

```js
add: (app, middleware, options) => {
  // ...
}
```

### `add` Function Parameters

- `app` The underlying Koa app
- `middleware` An object containing accessor functions to call both
`webpack-dev-middleware` and the `koa-static` middleware.
- `options` - The internal options object used by `webpack-serve`

Some add-on patterns may require changing the order of middleware used in the
`app`. For instance, if adding routes or using a separate router with the `app`
where routes must be added last, you'll need to call the `middleware` functions
early on. `webpack-serve` recognizes these calls and will not execute them again.
If these calls were omitted, `webpack-serve` would execute both in the default,
last in line, order.

```js
add: (app, middleware, options) => {
  // since we're manipulating the order of middleware added, we need to handle
  // adding these two internal middleware functions.
  middleware.webpack();
  middleware.content();

  // router *must* be the last middleware added
  app.use(router.routes());
}
```

Listed below are some of the add-on patterns and recipes that can be found in
[docs/addons](docs/addons):

- [bonjour](docs/addons/bonjour.config.js)
- [compress](docs/addons/compress)
- [historyApiFallback](docs/addons/history-fallback.config.js)
- [proxy + history fallback](docs/addons/proxy-history-fallback.config.js)
- [proxy + router](docs/addons/proxy-router.config.js)
- [staticOptions](docs/addons/static-content-options.config.js)
- [useLocalIp](docs/addons/local-ip.config.js)
- [watch content](docs/addons/watch-content.config.js)

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
