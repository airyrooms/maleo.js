// tslint:disable:no-console

// Highly inspired from // Taken from https://github.com/facebook/create-react-app/blob/v1.1.4/packages/react-dev-utils/webpackHotDevClient.js
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

// This alternative WebpackDevServer combines the functionality of:
// https://github.com/webpack/webpack-dev-server/blob/webpack-1/client/index.js
// https://github.com/webpack/webpack/blob/webpack-1/hot/dev-server.js

// It only supports their simplest configuration (hot updates on same server).
// It makes some opinionated choices on top, like adding a syntax error overlay
// that looks similar to our console output. The error overlay is inspired by:
// https://github.com/glenjamin/webpack-hot-middleware

// I think HMR is a bit of an issue itself, we may just support a browser reload for every changes made
// but I will find other way to work this thing out
// more details: https://github.com/gaearon/react-hot-boilerplate/issues/97#issuecomment-249862775

// pollyfill for older browser
export function clientHMR(option?) {
  window['EventSource'] = window['EventSource'] || require('eventsource');

  const url = '/__webpack_hmr';

  connect(url);

  return function(initialize) {
    if (typeof initialize === 'function') {
      initialize();
    }
  };
}

// Remember some state related to hot module replacement.
let isFirstCompilation = true;
let mostRecentCompilationHash = null;
let hasCompileErrors = false;
const hadRuntimeError = false;

function connect(sourceURL: string) {
  console.info('[HMR] Connecting...');
  const newES = new window['EventSource'](sourceURL);
  attachListener(newES);
}

function attachListener(eventSource: EventSource) {
  eventSource.onopen = function(event) {
    console.info('[HMR] Connected');
  };

  eventSource.onerror = function(event) {
    console.error('[HMR] Disconnected');
    eventSource.close();

    console.info('[HMR] Trying to reconnect in 10 seconds, or refresh to reconnect immediately');
    setTimeout(() => connect(eventSource.url), 10000);
  };

  eventSource.onmessage = function(event) {
    // event.data will be a JSON string containing the message event.
    try {
      hmrMessageHandler(JSON.parse(event.data));
    } catch (error) {
      return;
    }
  };
}

function hmrMessageHandler(data) {
  const { action, name, hash } = data;

  switch (action) {
    case 'building':
      console.info('[HMR] bundle ' + (name ? `'${name}\' ` : '') + 'rebuilding');
      isFirstCompilation = false;
      break;
    case 'built':
    case 'sync':
      clearOutdatedErrors();

      handleAvailableHash(hash);
      handleSuccess();
      break;

    default:
  }
}

function clearOutdatedErrors() {
  // Clean up outdated compile errors, if any.
  if (typeof console !== 'undefined' && typeof console.clear === 'function') {
    if (hasCompileErrors) {
      console.clear();
    }
  }
}

// Successful Compilation
function handleSuccess() {
  clearOutdatedErrors();

  const isHotUpdate = !isFirstCompilation;
  isFirstCompilation = false;
  hasCompileErrors = false;

  if (isHotUpdate) {
    // apply updates
    console.log('[HMR] Applying update');
    tryApplyUpdates(function onHotUpdateSuccess() {
      // Only dismiss it when we're sure it's a hot update.
      // Otherwise it would flicker right before the reload.
      // ErrorOverlay.dismissBuildError();
      // console.log('[HMR] Modules updated');
      window.location.reload();
    });
  }
}

// Is there a newer version of this code available?
function isUpdateAvailable() {
  /* globals __webpack_hash__ */
  // __webpack_hash__ is the hash of the current compilation.
  // It's a global variable injected by Webpack.
  return mostRecentCompilationHash !== __webpack_hash__;
}

// Webpack disallows updates in other states.
function canApplyUpdates() {
  return module.hot.status() === 'idle';
}

// There is a newer version of the code available.
function handleAvailableHash(hash) {
  // Update last known compilation hash.
  mostRecentCompilationHash = hash;
}

// Attempt to update code on the fly, fall back to a hard reload.
function tryApplyUpdates(onHotUpdateSuccess?) {
  // HotModuleReplacementPlugin is not in Webpack configuration.
  // do hard reload if HMR not available
  if (!module.hot) {
    window.location.reload();
    return;
  }

  if (!isUpdateAvailable() || !canApplyUpdates()) {
    return;
  }

  // https://webpack.github.io/docs/hot-module-replacement.html#check
  const result = module.hot.check(/* autoApply */ true, handleApplyUpdates);

  // // Webpack 2 returns a Promise instead of invoking a callback
  if (result && result.then) {
    result.then(
      function(updatedModules) {
        handleApplyUpdates(null, updatedModules);
      },
      function(err) {
        handleApplyUpdates(err, null);
      },
    );
  }

  function handleApplyUpdates(err, updatedModules) {
    if (err || !updatedModules || hadRuntimeError) {
      window.location.reload();
      return;
    }

    if (typeof onHotUpdateSuccess === 'function') {
      // Maybe we want to do something.
      onHotUpdateSuccess();
    }

    if (isUpdateAvailable()) {
      // While we were updating, there was a new update! Do it again.
      tryApplyUpdates(onHotUpdateSuccess);
    }
  }
}
