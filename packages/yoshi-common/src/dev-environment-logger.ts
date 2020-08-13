import chalk from 'chalk';
import { Urls } from 'react-dev-utils/WebpackDevServerUtils';
import clearConsole from 'react-dev-utils/clearConsole';
import { State, ProcessState, ProcessType } from './dev-environment';
import { getUrl, getDevServerUrl } from './utils/suricate';

const isInteractive = process.stdout.isTTY;
const isDebug = process.env.DEBUG;
const isProfiling = process.env.PROFILE;

export const logSuricateUrls = (type: ProcessType, appName: string) => {
  switch (type) {
    case 'AppServer':
      console.log(
        `  ${chalk.bold('Public:')} ${chalk.magenta(getUrl(appName))}`,
      );
      break;
    case 'DevServer':
      console.log(
        `  ${chalk.bold('Public:')} ${chalk.magenta(getDevServerUrl(appName))}`,
      );
      break;
  }
};

const logMessageByProcessType: { [type in ProcessType]: string } = {
  AppServer: `Your server is starting and should be accessible from your browser.`,
  Storybook:
    'Storybook is starting and should be accessible from your browser.',
  DevServer: `Your bundles and other static assets are served from your ${chalk.bold(
    'dev-server',
  )}.`,
  TypeScript: 'TypeScript compiled successfully',
};

const logUrls = ({
  processType,
  urls,
  suricate,
  appName,
}: {
  processType: ProcessType;
  urls?: Urls;
  suricate?: boolean;
  appName: string;
}) => {
  console.log();
  console.log(logMessageByProcessType[processType]);
  console.log();

  if (suricate && processType !== 'Storybook') {
    logSuricateUrls(processType, appName);
  } else {
    console.log(
      `  ${chalk.bold('Local:')}            ${urls?.localUrlForTerminal}`,
    );
    console.log(
      `  ${chalk.bold('On Your Network:')}  ${urls?.lanUrlForTerminal}`,
    );
  }

  console.log();
};

export const getProcessName = (type: ProcessType) =>
  chalk.greenBright(`[${type.toUpperCase()}]`);

export const logProcessState = (
  {
    processType,
    suricate,
    appName,
  }: {
    processType: ProcessType;
    suricate?: boolean;
    appName: string;
  },
  state: ProcessState,
) => {
  switch (state.status) {
    case 'compiling':
      console.log();
      console.log(`${getProcessName(processType)}:`, 'Compiling...');
      break;

    case 'success':
      if (processType === 'TypeScript') {
        console.log('');
        console.log('Found 0 type errors. Watching for file changes.');
      } else {
        logUrls({ processType, suricate, appName, urls: state.urls });
      }
      break;
  }
};

export const hasErrorsOrWarnings = (state: State): boolean => {
  return Object.values(state.processes).some((processState) =>
    ['errors', 'warnings'].includes(processState?.status as string),
  );
};

export const logStateErrorsOrWarnings = (state: State) => {
  const { DevServer, TypeScript, Storybook } = state.processes;

  if (TypeScript && TypeScript.status === 'errors') {
    console.log(TypeScript.errors?.join('\n\n'));
    return;
  }

  if (DevServer && DevServer.status === 'errors') {
    console.log(chalk.red('Failed to compile.\n'));
    console.log(DevServer.errors?.join('\n\n'));
    return;
  }

  if (Storybook && Storybook.status === 'errors') {
    console.log(chalk.red('Failed to compile.\n'));
    console.log(Storybook.errors?.join('\n\n'));
    return;
  }

  if (DevServer && DevServer.status === 'warnings') {
    console.log(chalk.red('Compiled with warnings.\n'));
    console.log(DevServer.warnings?.join('\n\n'));
    return;
  }

  if (Storybook && Storybook.status === 'warnings') {
    console.log(chalk.red('Compiled with warnings.\n'));
    console.log(Storybook.warnings?.join('\n\n'));
    return;
  }
};

const logRestarting = () => {
  console.log();
  console.log(' Restarting app server...');
  console.log();
};

export const shouldClearConsole = () => {
  return isInteractive && !isDebug && !isProfiling;
};

export const isAllCompiled = (state: State): boolean => {
  return Object.values(state.processes).every((process) => {
    return process?.status === 'success';
  });
};

export type DevEnvironmentLogger = (opts: {
  state: State;
  appName: string;
  suricate: boolean;
  suffix: string;
}) => void;

function logUsageInstructions(state: State) {
  if (state.processes.AppServer) {
    console.log(chalk.bold('Usage'));
    console.log(` › Press ${chalk.bold('r')} to restart the app server`);
    console.log();
  }
}

const logger: DevEnvironmentLogger = ({ state, appName, suricate, suffix }) => {
  if (shouldClearConsole()) {
    clearConsole();
  }

  if (state.restarting) {
    return logRestarting();
  }

  if (hasErrorsOrWarnings(state)) {
    return logStateErrorsOrWarnings(state);
  }

  if (isAllCompiled(state)) {
    console.log(chalk.green('Compiled successfully!'));
  } else {
    console.log(chalk.bold('Compiling...'));
  }

  for (const processTypeKey in state.processes) {
    const processType = processTypeKey as ProcessType;
    const processState = state.processes[processType];

    processState &&
      logProcessState({ processType, suricate, appName }, processState);
  }

  console.log();
  console.log('Note that the development build is not optimized.');
  console.log(
    `To create a production build, use ${chalk.cyan('npm run build')}.`,
  );
  console.log();

  logUsageInstructions(state);

  if (suffix) {
    console.log(suffix);
  }
};

export default logger;
