import path from 'path';
import arg from 'arg';
import fs from 'fs-extra';
import chalk from 'chalk';
import {
  printBuildResult,
  printClientBuildResult,
  printServerBuildResult,
  printBundleSizeSuggestion,
} from 'yoshi-common/build/print-build-results';
import WebpackManager from 'yoshi-common/build/webpack-manager';
import {
  STATICS_DIR,
  TARGET_DIR,
  SERVER_CHUNKS_BUILD_DIR,
  SERVER_BUNDLE,
} from 'yoshi-config/build/paths';
import { inTeamCity as checkInTeamCity } from 'yoshi-helpers/build/queries';
import { copyTemplates } from 'yoshi-common/build/copy-assets';
import { stripOrganization } from 'yoshi-helpers/build/utils';
import * as telemetry from 'yoshi-common/build/telemetry';
import { cliCommand } from '../bin/yoshi-monorepo';
import {
  createClientWebpackConfig,
  createServerWebpackConfig,
  createWebWorkerWebpackConfig,
  createWebWorkerServerWebpackConfig,
  createSiteAssetsWebpackConfig,
} from '../webpack.config';
import buildPkgs from '../build';
import { isThunderboltAppModule } from '../utils';

const inTeamCity = checkInTeamCity();

const build: cliCommand = async function (argv, rootConfig, { apps, libs }) {
  telemetry.buildStart('Monorepo', rootConfig.name);

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
        $ yoshi-monorepo build [app-name ...]

      Options
        --help, -h      Displays this message
        --analyze       Run webpack-bundle-analyzer
        --stats         Emit webpack's stats file on "target/webpack-stats.json"
        --source-map    Emit bundle source maps
    `,
    );

    process.exit(0);
  }

  const appNames = args._;

  if (appNames.length) {
    appNames.forEach((appName) => {
      const pkg = apps.find((pkg) => stripOrganization(pkg.name) === appName);

      if (!pkg) {
        console.log(
          `Could not find an app with the name of ${chalk.cyan(appName)}!\n`,
        );

        console.log('Apps found:');
        console.log(
          `  ${apps
            .map(({ name }) => name)
            .map(stripOrganization)
            .map((name) => chalk.cyanBright(name))
            .join(', ')}`,
        );
        console.log();
        console.log(chalk.red('Aborting...'));

        return process.exit(1);
      }
    });

    apps = apps.filter((app) => appNames.includes(stripOrganization(app.name)));
  }

  if (!process.env.SKIP_TSC) {
    await buildPkgs([...libs, ...apps]);
  }

  await Promise.all(
    apps.reduce((acc: Array<Promise<void>>, app) => {
      return [
        ...acc,
        fs.emptyDir(path.join(app.location, STATICS_DIR)),
        fs.emptyDir(path.join(app.location, TARGET_DIR)),
        fs.emptyDir(path.join(app.location, SERVER_CHUNKS_BUILD_DIR)),
        fs.unlink(path.join(app.location, SERVER_BUNDLE)).catch(() => {}),
      ];
    }, []),
  );

  await Promise.all(apps.map((app) => copyTemplates(app.location)));

  if (inTeamCity) {
    const petriSpecs = await import('yoshi-common/build/sync-petri-specs');
    const wixMavenStatics = await import('yoshi-common/build/maven-statics');
    const copyDocker = await import('yoshi-common/build/copy-docker');

    // Run petri-specs once in the root of the monorepo
    await petriSpecs.default();

    await Promise.all(
      apps.reduce((acc: Array<Promise<void>>, app) => {
        return [
          ...acc,
          wixMavenStatics.default({
            clientProjectName: app.config.clientProjectName,
            staticsDir: app.config.clientFilesPath,
            cwd: app.location,
          }),
          copyDocker.default(app.config, app.location),
        ];
      }, []),
    );
  }

  const webpackManager = new WebpackManager();

  // If there are more than 2 applications, the screen size
  // is just not big enough for the fancy progress bar
  // so we configure it to not be showed
  if (apps.length > 2) {
    process.env.PROGRESS_BAR = 'false';
  }

  apps.forEach((pkg) => {
    let siteAssetsConfigNode;
    let siteAssetsConfigWeb;

    const clientDebugConfig = createClientWebpackConfig(pkg, libs, apps, {
      isDev: true,
      forceEmitSourceMaps,
    });

    const clientOptimizedConfig = createClientWebpackConfig(pkg, libs, apps, {
      isAnalyze,
      forceEmitSourceMaps,
      forceEmitStats,
    });

    if (pkg.config.siteAssetsEntry) {
      // for running in the server
      siteAssetsConfigNode = createSiteAssetsWebpackConfig(pkg, libs, apps, {
        isDev: false,
        target: 'node',
        isAnalyze,
        forceEmitSourceMaps,
        forceEmitStats,
        forceMinimizeServer: true,
        disableEmitSourceMaps: true,
        keepFunctionNames: true,
      });

      // for running in the browser
      siteAssetsConfigWeb = createSiteAssetsWebpackConfig(pkg, libs, apps, {
        isDev: false,
        target: 'web',
        isAnalyze,
        forceEmitSourceMaps,
        forceEmitStats,
        transpileCarmiOutput: true,
      });
    }

    const serverConfig = createServerWebpackConfig(pkg, libs, apps, {
      isDev: true,
    });

    let webWorkerConfig;
    let webWorkerOptimizeConfig;

    if (pkg.config.webWorkerEntry) {
      webWorkerConfig = createWebWorkerWebpackConfig(pkg, libs, apps, {
        isDev: true,
      });

      webWorkerOptimizeConfig = createWebWorkerWebpackConfig(pkg, libs, apps, {
        isAnalyze,
        forceEmitStats,
      });
    }

    let webWorkerServerConfig;

    if (pkg.config.webWorkerServerEntry) {
      webWorkerServerConfig = createWebWorkerServerWebpackConfig(
        pkg,
        libs,
        apps,
        {
          isDev: !isThunderboltAppModule(pkg),
        },
      );
    }

    webpackManager.addConfigs(pkg.name, [
      clientDebugConfig,
      clientOptimizedConfig,
      serverConfig,
      webWorkerConfig,
      webWorkerOptimizeConfig,
      webWorkerServerConfig,
      siteAssetsConfigNode,
      siteAssetsConfigWeb,
    ]);
  });

  const { getAppData } = await webpackManager.run();

  apps.forEach((pkg) => {
    console.log(chalk.bold.underline(pkg.name));
    console.log();

    const [, clientOptimizedStats, serverStats] = getAppData(pkg.name).stats;

    printBuildResult({
      webpackStats: [clientOptimizedStats, serverStats],
      cwd: pkg.location,
    });

    console.log();

    if (pkg.config.siteAssetsEntry) {
      const stats = getAppData(pkg.name).stats;

      const siteAssetsBrowserStats = stats.find(
        // @ts-ignore types miss this property
        (s) => s.compilation.name === 'site-assets',
      );

      const siteAssetsNodeStats = stats.find(
        // @ts-ignore types miss this property
        (s) => s.compilation.name === 'site-assets-server',
      );

      if (siteAssetsBrowserStats) {
        console.log(chalk.underline('Site Assets (web)'));
        printClientBuildResult(siteAssetsBrowserStats);
        console.log();
      }

      if (siteAssetsNodeStats) {
        console.log(chalk.underline('Site Assets (node)'));
        printServerBuildResult(siteAssetsNodeStats);
      }
    }

    console.log();
  });

  printBundleSizeSuggestion();
};

export default build;
