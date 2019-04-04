#!/usr/bin/env node

// TSLINT RULES
// tslint:disable:no-console

process.exitCode = 0;
// process.stdout.write('\033c'); // clears console

// PROCESS USER INPUTS
const [, , type, buildType = 'all', ...args] = process.argv;

// Declare needed vars
const env = process.env.NODE_ENV || 'development';
const isDev = env === 'development';

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

const userConfig = loadUserConfig(projectPath);
const buildDirectory = userConfig.buildDir || BUILD_DIR;

// Generating server execution
const serverPath = path.join(buildDirectory, SERVER_BUILD_DIR, 'server.js');
const exec = spawn.bind(null, 'node', [serverPath], {
  stdio: 'inherit',
});

if (type === 'run') {
  console.log('[MALEO] Running Application');
  exec();
} else if (type === 'export') {
  console.log('[MALEO] Running static export');
  global.__DEV__ = isDev;
  exportStatic(userConfig);
} else {
  // Clean up the folder
  rimraf(path.join(projectPath, buildDirectory), {}, () => {
    console.log('==> Current Working Directory: ', projectPath);
    console.log('==> Current Build Directory: ', buildDirectory);
    console.log('==> Environment (isDevelopment): ', env, '(' + isDev + ')');
    console.log('==> Running Command: ', type);
    console.log('==> Command Args: ', args);

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
      });
    }
  });
}
