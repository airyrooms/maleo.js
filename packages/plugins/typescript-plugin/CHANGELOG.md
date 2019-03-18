# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## 0.0.6-canary.50 (2019-03-18)


### Bug Fixes

* **babelconfigjs:** fix built absolute path to relative path ([#19](https://github.com/airyrooms/maleo.js/issues/19)) ([064352c](https://github.com/airyrooms/maleo.js/commit/064352c))
* **webpack client server:** remove hmr but fix sync ([#33](https://github.com/airyrooms/maleo.js/issues/33)) ([8a9f326](https://github.com/airyrooms/maleo.js/commit/8a9f326))


### Features

* **maleo playground:** add default server and client ([#29](https://github.com/airyrooms/maleo.js/issues/29)) ([e40897b](https://github.com/airyrooms/maleo.js/commit/e40897b))


### BREAKING CHANGES

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
