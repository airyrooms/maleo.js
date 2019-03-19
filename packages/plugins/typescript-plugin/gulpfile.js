const gulpTaskRunner = require('@airy/gulp-plugin');

const distDir = '.';
const paths = {
  lib: 'src/*.js',
};

gulpTaskRunner(paths, distDir);
