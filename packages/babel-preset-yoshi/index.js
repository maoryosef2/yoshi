const DEFAULT_ENV = 'development';
const DEFAULT_MODULES = 'commonjs';
const env = process.env.BABEL_ENV || process.env.NODE_ENV || DEFAULT_ENV;
const disablePropTypeRemoval = process.env.DISABLE_REACT_PROP_TYPE_REMOVAL;
const deprecatedLegacyDecoratorsSupported =
  process.env.DEPRECATED_LEGACY_DECORATORS === 'true';

const requireDefault = (path) => {
  const required = require(path);
  return required.default || required;
};

const normaliseOptions = (opts) => {
  return {
    ...opts,
    include: opts.include || [],
    exclude: opts.exclude || [],
  };
};

module.exports = function (api, opts = {}) {
  const options = normaliseOptions(opts);
  const inWebpack = process.env.IN_WEBPACK;

  // eslint-disable-next-line prefer-const
  let { modules, mode = env } = options;

  const isDevelopment = mode === 'development';
  const isProduction = mode === 'production';
  const isTest = mode === 'test';

  if (typeof modules === 'undefined') {
    modules = inWebpack ? false : DEFAULT_MODULES;
  }

  return {
    presets: [
      [
        requireDefault('@babel/preset-env'),
        {
          modules,
          // Display targets to compile for.
          debug: options.debug,
          include: [
            // Always use destructuring b/c of import/export support.
            'transform-destructuring',
            // On development we don't transpile this syntax becuase it's actually supported on latest browsers
            // Webpack 4 still doesn't know how to parse it https://github.com/webpack/webpack/issues/10227#issuecomment-642734920
            // This will make sure it will always be supplied (even on development)
            'proposal-nullish-coalescing-operator',
            'proposal-optional-chaining',
            ...options.include,
          ],
          exclude: options.exclude,
          // We don't need to be fully spec compatible, bundle size is more important.
          loose: true,
          // Allow users to provide its own targets and supply target node for test environment by default.
          targets:
            options.targets ||
            (isDevelopment &&
              'last 2 chrome versions, last 2 firefox versions') ||
            (isTest && 'current node'),
        },
      ],
      !options.ignoreReact && [
        requireDefault('@babel/preset-react'),
        {
          development: isDevelopment || isTest,
        },
      ],
    ].filter(Boolean),
    plugins: [
      // Enable stage 2 decorators.
      [
        requireDefault('@babel/plugin-proposal-decorators'),
        deprecatedLegacyDecoratorsSupported
          ? { legacy: true }
          : { decoratorsBeforeExport: true },
      ],
      [
        // Allow the usage of class properties.
        requireDefault('@babel/plugin-proposal-class-properties'),
        {
          // Bundle size and perf is prior to tiny ES spec incompatibility.
          loose: true,
        },
      ],
      [
        // Add helpers for generators and async/await.
        requireDefault('@babel/plugin-transform-runtime'),
        {
          // 2 options blow are usually handled by polyfill.io.
          helpers: process.env.EXPERIMENTAL_BABEL_SHARED_HELPERS === 'true',
          regenerator: true,
        },
      ],
      requireDefault('@babel/plugin-syntax-dynamic-import'),
      // The `modules` variable can be `false` for ESmodules and `commonjs` for CommonJS
      // modules: Webpack (server & client) & library ES build
      // CommonJS: Tests & old flow (server & library)
      //
      // https://github.com/airbnb/babel-plugin-dynamic-import-node/issues/27
      modules && requireDefault('babel-plugin-dynamic-import-node'),
      // Current Node and new browsers (in development environment) already implement it so
      // just add the syntax of Object { ...rest, ...spread }
      (isDevelopment || isTest) &&
        requireDefault('@babel/plugin-syntax-object-rest-spread'),

      ...(!isProduction
        ? []
        : [
            // Transform Object { ...rest, ...spread } to support old browsers
            [
              requireDefault('@babel/plugin-proposal-object-rest-spread'),
              {
                loose:
                  process.env.EXPERIMENTAL_BABEL_OBJECT_SPREAD_LOOSE === 'true',
              },
            ],
            !options.ignoreReact &&
              !disablePropTypeRemoval && [
                // Remove PropTypes on react projects.
                requireDefault(
                  'babel-plugin-transform-react-remove-prop-types',
                ),
                {
                  removeImport: true,
                },
              ],
          ]),
    ].filter(Boolean),
  };
};
