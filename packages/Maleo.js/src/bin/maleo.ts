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
const buildDirectory = path.join(projectPath, '.maleo');

// bin codes starts here
// Importing node's own dependencies
import path from 'path';
import figlet from 'figlet';
import { spawn } from 'child_process';

// Importing required bin dependencies
import { build } from '../build/index';

console.log(
  figlet.textSync('Maleo.JS', {
    horizontalLayout: 'default',
    verticalLayout: 'default',
  }),
);

console.log('==> Current Working Directory: ', projectPath);
console.log('==> Environment (isDevelopment): ', env, '(' + isDev + ')');
console.log('==> Running Command: ', type);
console.log('==> Command Args: ', args);

if (type === 'build') {
  console.log('==> Running build');
  build({
    env,
    buildType,
  });
} else if (type === 'run' || !type) {
  console.log('[MALEO] Running Application');

  const serverPath = path.join(buildDirectory, 'server.js');

  const exec = spawn.bind(null, 'node', [serverPath], {
    stdio: 'inherit',
  });

  if (isDev) {
    build({
      env,
      buildType: 'server',
      callback: exec,
    });
  } else {
    exec();
  }
}
