const { resolve } = require('path');

const webpack = require('webpack');

const { load, prepare, timeFix, toArray } = require('../lib/config');

const { HotModuleReplacementPlugin: HMR } = webpack;

/* eslint-disable no-param-reassign */

describe('config', () => {
  test('timeFix', () => {
    const config = {};
    expect(timeFix(config)).toMatchSnapshot();
  });

  test('toArray: Array', () => {
    const config = { entry: ['file'] };
    expect(toArray(config)).toMatchSnapshot();
  });

  test('toArray: String', () => {
    const config = { entry: 'file' };
    expect(toArray(config)).toMatchSnapshot();
  });

  test('toArray: undefined', () => {
    const config = {};
    expect(toArray(config)).toMatchSnapshot();
  });

  test('toArray: Object > String', () => {
    const config = { entry: { a: 'file-a', b: 'file-b' } };
    expect(toArray(config)).toMatchSnapshot();
  });

  test('toArray: Object > Array', () => {
    const config = { entry: { a: ['file'] } };
    expect(toArray(config)).toMatchSnapshot();
  });

  test('prepare', () => {
    let config = {};
    expect(prepare(config)).toMatchSnapshot();

    config = { entry: ['file'] };
    expect(prepare(config)).toMatchSnapshot();

    config = { entry: ['file'], plugins: [new HMR()] };
    expect(prepare(config)).toMatchSnapshot();
  });

  test('load: bad argv', () => {
    const argv = undefined; // eslint-disable-line no-undefined
    const config = { entry: 'file' };
    return load(argv, { config }).then((configs) => {
      expect(configs).toMatchSnapshot();
    });
  });

  test('load: Object', () => {
    const argv = {};
    const config = { entry: 'file' };
    return load(argv, { config }).then((configs) => {
      expect(configs).toMatchSnapshot();
    });
  });

  test('load: Array', () => {
    const argv = {};
    const config = [{ entry: 'file-a' }, { entry: 'file-b' }];
    return load(argv, { config }).then((configs) => {
      expect(configs).toMatchSnapshot();
    });
  });

  test('load: Compiler', () => {
    const argv = {};
    const config = {};
    const compiler = webpack(config);
    return load(argv, { compiler }).then((configs) => {
      configs = configs.map((conf) => {
        delete conf.optimization;
        return conf;
      });
      expect(configs).toMatchSnapshot();
    });
  });

  test('load: MultiCompiler', () => {
    const argv = {};
    const config = [{ entry: 'file-a' }, { entry: 'file-b' }];
    const compiler = webpack(config);
    return load(argv, { compiler }).then((configs) => {
      configs = configs.map((conf) => {
        delete conf.optimization;
        return conf;
      });
      expect(configs).toMatchSnapshot();
    });
  });

  test('load: absolute path', () => {
    const argv = {};
    const config = resolve(__dirname, './fixtures/basic/webpack.config.js');
    return load(argv, { config }).then((configs) => {
      expect(configs).toMatchSnapshot();
    });
  });

  test('load: relative path', () => {
    const argv = {};
    const config = './test/fixtures/basic/webpack.config.js';
    return load(argv, { config }).then((configs) => {
      expect(configs).toMatchSnapshot();
    });
  });

  test('load: not found', () => {
    const argv = {};
    return load(argv, {}).then((configs) => {
      expect(configs).toMatchSnapshot();
    });
  });
});
