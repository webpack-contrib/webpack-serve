const webpack = require('webpack');

const eventbus = require('../lib/bus');
const { getCompiler } = require('../lib/compiler');

const compile = (compiler) =>
  new Promise((resolve) => compiler.run(() => setTimeout(resolve, 100)));
const getConfig = (name) => require(`./fixtures/${name}/webpack.config`);
const waitForEvent = (bus, name) =>
  new Promise((resolve) => bus.on(name, resolve));

/* eslint-disable no-param-reassign */

// this is all to allow for cross-node-version snapshot comparison
const pick = ({ context, name, options }) => {
  delete options.optimization;
  return { context, name, options };
};

describe('compiler', () => {
  test('getCompiler', () => {
    const bus = eventbus({});
    const config = getConfig('basic');
    const result = getCompiler([config], { bus });
    const picked = pick(result);

    expect(picked).toMatchSnapshot();

    return Promise.all([
      waitForEvent(bus, 'build-started').then((data) => {
        expect(Object.keys(data)).toMatchSnapshot();
        expect(data.compiler.constructor.name).toMatchSnapshot();
      }),
      waitForEvent(bus, 'build-finished').then((data) => {
        const { assets, errors, warnings } = data.stats.toJson();
        expect({
          assets,
          errors: errors.length,
          warnings: warnings.length,
        }).toMatchSnapshot();
      }),
      compile(result),
    ]);
  });

  test('getCompiler with existing compiler', () => {
    const bus = eventbus({});
    const config = getConfig('basic');
    const compiler = webpack(config);
    const result = getCompiler([], { bus, compiler });
    const picked = pick(result);

    expect(picked).toMatchSnapshot();

    return Promise.all([
      waitForEvent(bus, 'build-started').then((data) => {
        expect(Object.keys(data)).toMatchSnapshot();
        expect(data.compiler.constructor.name).toMatchSnapshot();
      }),
      waitForEvent(bus, 'build-finished').then((data) => {
        const { assets, errors, warnings } = data.stats.toJson();
        expect({
          assets,
          errors: errors.length,
          warnings: warnings.length,
        }).toMatchSnapshot();
      }),
      compile(result),
    ]);
  });

  test('errors', () => {
    const bus = eventbus({});
    const config = getConfig('error');
    const result = getCompiler([config], { bus });
    const picked = pick(result);

    expect(picked).toMatchSnapshot();

    return Promise.all([
      waitForEvent(bus, 'compiler-error').then((data) => {
        const { errors } = data.json;
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0]).toMatch(/Module not found/);
      }),
      waitForEvent(bus, 'build-finished'),
      compile(result),
    ]);
  });

  test('warnings', () => {
    const bus = eventbus({});
    const config = getConfig('warning');
    const result = getCompiler([config], { bus });
    const picked = pick(result);

    expect(picked).toMatchSnapshot();

    return Promise.all([
      waitForEvent(bus, 'compiler-warning').then((data) => {
        let { warnings } = data.json;
        warnings = warnings.map((warning) =>
          warning.replace(/\s+at(.+)\)\n/g, '')
        );
        expect(warnings).toMatchSnapshot();
      }),
      waitForEvent(bus, 'build-finished'),
      compile(result),
    ]);
  });

  test('invalid config error', () => {
    const bus = eventbus({});
    const config = require('./fixtures/invalid.config');
    const fn = () => getCompiler([config], { bus });

    expect(fn).toThrowErrorMatchingSnapshot();
  });
});
