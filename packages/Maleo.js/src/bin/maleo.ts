#!/usr/bin/env node

// TSLINT RULES
// tslint:disable:no-console

process.exitCode = 0;
// process.stdout.write('\033c'); // clears console

// PROCESS USER INPUTS
const [, , type, ...args] = process.argv;

const defaultArgs = {
  buildType: 'all',
  experimentalLazyBuild: false,
};

const userArgs = args.reduce((prev, arg) => {
  // match --[keyArgument]=[value] or --keyArgument
  // if no value is present then it is considered to be true
  const match = arg.match(/--(.+)(?:=){0,1}(.*)/);

  if (match) {
    const [, keyArgument, value] = match;
    switch (keyArgument) {
      case 'experimentalLazyBuild':
        return {
          ...prev,
          [keyArgument]: value === '' || Boolean(JSON.parse(value)),
        };
      case 'buildType':
        let typeValue = value;
        if (value !== 'all' && value !== 'server' && value !== 'client') {
          typeValue = 'all';
        }

        return {
          ...prev,
          [keyArgument]: typeValue,
        };
      default:
        return prev;
    }
  }
  return prev;
}, defaultArgs);

const { buildType, experimentalLazyBuild } = userArgs;

const binaryPath = path.resolve(__dirname);
const projectPath = path.resolve(process.cwd());

// bin codes starts here
// Importing node's own dependencies
import path from 'path';
import figlet from 'figlet';
import rimraf from 'rimraf';
import { spawn } from 'child_process';

// Importing required bin dependencies
import { build, exportStatic } from '@build/index';
import { loadUserConfig } from '@build/webpack/webpack';
import { BUILD_DIR, SERVER_BUILD_DIR } from '@constants/index';

console.log(
  figlet.textSync('Maleo.js', {
    horizontalLayout: 'default',
    verticalLayout: 'default',
  }),
);

// Initiate default value for NODE_ENV if not set by user
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const userConfig = loadUserConfig(projectPath);
const buildDirectory = userConfig.buildDir || BUILD_DIR;

// Declare needed vars
const env = process.env.NODE_ENV;
const { isDev = env === 'development' } = userConfig;

// Generating server execution
const serverPath = path.join(buildDirectory, SERVER_BUILD_DIR, 'server.js');
const exec = () => {
  spawn('node', [serverPath], {
    stdio: 'inherit',
  });
};
if (type === 'run') {
  console.log('[MALEO] Running Application');
  exec();
} else if (type === 'export') {
  console.log('[MALEO] Running static export');
  exportStatic(userConfig);
} else {
  // Clean up the folder
  rimraf(path.join(projectPath, buildDirectory), {}, () => {
    console.log('==> Current Working Directory: ', projectPath);
    console.log('==> Current Build Directory: ', buildDirectory);
    console.log('==> Environment (isDevelopment): ', env, '(' + isDev + ')');
    console.log('==> Running Command: ', type);
    console.log('==> Command Args: ', userArgs);

    if (type === 'build') {
      console.log('==> Running build');
      build({
        env,
        buildType,
      });
    } else if (type === 'dev') {
      console.log('[MALEO] Running Development');

      build({
        env,
        buildType: 'server',
        callback: exec,
        minimalBuild: true,
        experimentalLazyBuild,
      });
    }
  });
}
