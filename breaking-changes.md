
# Breaking Changes

## API

- serve(options) -> serve(argv, options)
- serve(argv, options) returns a promise that resolves when the server has begun
listening and is fully setup. negates the need for the `listening` event.
- serve(argv, options) resolved value contains `app`, `on`, `options`
- --dev -> --devWare
- --hot -> --hotClient
- options.dev -> options.devMiddleware
- options.hot -> options.hotClient