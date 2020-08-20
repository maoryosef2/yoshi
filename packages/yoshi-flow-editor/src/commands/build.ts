import path from 'path';
import arg from 'arg';
import { runWebpack } from 'yoshi-common/build/webpack-utils';
import {
  printBuildResult,
  printBundleSizeSuggestion,
} from 'yoshi-common/build/print-build-results';
import publishServerless from 'yoshi-server-tools/build/serverless-publish';
import { copyTemplates } from 'yoshi-common/build/copy-assets';
import {
  BUILD_DIR,
  TARGET_DIR,
  SERVERLESS_DIR,
} from 'yoshi-config/build/paths';
import { inTeamCity } from 'yoshi-helpers/build/queries';
import fs from 'fs-extra';
import * as telemetry from 'yoshi-common/build/telemetry';
import {
  createClientWebpackConfig,
  createServerWebpackConfig,
  createWebWorkerWebpackConfig,
} from '../webpack.config';
import { cliCommand } from '../cli';
import {
  buildClientEntries,
  buildWorkerEntries,
  webWorkerExternals,
} from '../buildEntires';
import { overrideBILoggerTypes } from '../wrappers/biLoggerTypes';
import { writeCiConfig } from './ciConfigGenerator';
import { generateEditorHTMLFiles } from './htmlGenerator';

const join = (...dirs: Array<string>) => path.join(process.cwd(), ...dirs);

const build: cliCommand = async function (argv, config, model) {
  telemetry.buildStart('Editor', config.name);

  const args = arg(
    {
      // Types
      '--help': Boolean,
      '--analyze': Boolean,
      '--stats': Boolean,
      '--source-map': Boolean,

      // Aliases
      '-h': '--help',
    },
    { argv },
  );

  const {
    '--help': help,
    '--analyze': isAnalyze,
    '--stats': forceEmitStats,
    '--source-map': forceEmitSourceMaps,
  } = args;

  if (help) {
    console.log(
      `
      Description
        Compiles the application for production deployment

      Usage
        $ yoshi-app build

      Options
        --help, -h      Displays this message
        --analyze       Run webpack-bundle-analyzer
        --stats         Emit webpack's stats file on "target/webpack-stats.json"
        --source-map    Emit bundle source maps
    `,
    );

    process.exit(0);
  }

  await Promise.all([
    fs.emptyDir(join(BUILD_DIR)),
    fs.emptyDir(join(TARGET_DIR)),
    process.env.EXPERIMENTAL_YOSHI_SERVERLESS
      ? fs.emptyDir(join(SERVERLESS_DIR))
      : Promise.resolve(),
  ]);

  await copyTemplates();
  if (model.biConfig) {
    overrideBILoggerTypes(model.biConfig);
  }

  if (inTeamCity()) {
    await writeCiConfig(model);

    const petriSpecs = await import('yoshi-common/build/sync-petri-specs');
    const wixMavenStatics = await import('yoshi-common/build/maven-statics');
    const copyDocker = await import('yoshi-common/build/copy-docker');

    await Promise.all([
      petriSpecs.default({
        config: config.petriSpecsConfig,
      }),
      wixMavenStatics.default({
        clientProjectName: config.clientProjectName,
        staticsDir: config.clientFilesPath,
      }),
      copyDocker.default(config),
    ]);
  }

  const clientEntries = buildClientEntries(model);

  const clientDebugConfig = createClientWebpackConfig(config, {
    isDev: true,
    forceEmitSourceMaps,
    customEntry: clientEntries,
  });

  const clientOptimizedConfig = createClientWebpackConfig(config, {
    isAnalyze,
    forceEmitSourceMaps,
    forceEmitStats,
    customEntry: clientEntries,
  });

  const serverConfig = createServerWebpackConfig(config, {
    isDev: true,
  });

  const webWorkerCustomEntry = buildWorkerEntries(model);

  const webWorkerConfig = createWebWorkerWebpackConfig(config, {
    isDev: true,
    customEntry: webWorkerCustomEntry,
    webWorkerExternals,
  });

  const webWorkerOptimizeConfig = createWebWorkerWebpackConfig(config, {
    isAnalyze,
    customEntry: webWorkerCustomEntry,
    webWorkerExternals,
  });

  const { stats } = await runWebpack([
    clientDebugConfig,
    clientOptimizedConfig,
    serverConfig,
    webWorkerConfig,
    webWorkerOptimizeConfig,
  ]);

  const [, clientOptimizedStats, serverStats] = stats;

  printBuildResult({ webpackStats: [clientOptimizedStats, serverStats] });
  printBundleSizeSuggestion();
  generateEditorHTMLFiles(model);
  if (inTeamCity() && process.env.EXPERIMENTAL_YOSHI_SERVERLESS) {
    await publishServerless(config);
  }
};

export default build;
