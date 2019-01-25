const gulpTaskRunner = require('@airy/maleo-gulp-plugin');

const distDir = '.';
const paths = {
  lib: 'src/*.js',
};

gulpTaskRunner(paths, distDir);
