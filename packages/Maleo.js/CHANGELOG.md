# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## 0.0.6-canary.50 (2019-03-18)


### Bug Fixes

* **babelconfigjs:** fix built absolute path to relative path ([#19](https://github.com/airyrooms/maleo.js/issues/19)) ([064352c](https://github.com/airyrooms/maleo.js/commit/064352c))
* **css-plugin:** first render isl not working ([#48](https://github.com/airyrooms/maleo.js/issues/48)) ([7e67643](https://github.com/airyrooms/maleo.js/commit/7e67643))
* **require cache hmr:** add nextjs license ([#40](https://github.com/airyrooms/maleo.js/issues/40)) ([e5d0cc9](https://github.com/airyrooms/maleo.js/commit/e5d0cc9))
* **webpack:** missing .js extension on filename ([#30](https://github.com/airyrooms/maleo.js/issues/30)) ([159e30a](https://github.com/airyrooms/maleo.js/commit/159e30a))
* **webpack client server:** remove hmr but fix sync ([#33](https://github.com/airyrooms/maleo.js/issues/33)) ([8a9f326](https://github.com/airyrooms/maleo.js/commit/8a9f326))
* **webpack stats-writer plugin:** add dynamic key on stats json ([#41](https://github.com/airyrooms/maleo.js/issues/41)) ([114c465](https://github.com/airyrooms/maleo.js/commit/114c465))


### Features

* **maleo playground:** add default server and client ([#29](https://github.com/airyrooms/maleo.js/issues/29)) ([e40897b](https://github.com/airyrooms/maleo.js/commit/e40897b))
* **maleo webpack:** add rimraf before run and cache server ([#35](https://github.com/airyrooms/maleo.js/issues/35)) ([3b45e4e](https://github.com/airyrooms/maleo.js/commit/3b45e4e))
* **maleo-routes-split:** auto add key for routes ([#42](https://github.com/airyrooms/maleo.js/issues/42)) ([7a61301](https://github.com/airyrooms/maleo.js/commit/7a61301))
* **webpack client preset:** add simple hmr refresh ([#37](https://github.com/airyrooms/maleo.js/issues/37)) ([61fc321](https://github.com/airyrooms/maleo.js/commit/61fc321))
* **webpack loaders routes:** add auto code splitting on routes ([#36](https://github.com/airyrooms/maleo.js/issues/36)) ([a80c4e9](https://github.com/airyrooms/maleo.js/commit/a80c4e9))


### BREAKING CHANGES

* **webpack client preset:** new hash is not synced
* **maleo playground:** client haven't use the route yet

feat(client route): add register route

added register route for client to be able to pass it to window and feed to default client

docs(readmemd): update docs for default server and client

feat(webpack client wrap): add register wrap to window

feat(webpack register-loader client): auto register

add auto register using register loader for wrap and routes to be used by client

feat(webpack app client): add auto register for app

refactor(webpack): clean up static entries

refactor static entries to be more readable

fix(webpack): comment out hardsourcewbp

fix(webpack): fix node externals

fix(webpack server tsplugin): fix error not bundling on client

error caused by webpack getting imported to server.ts not sure what cause the error

feat(client): added register entry class

docs(readmemd): update register route readme