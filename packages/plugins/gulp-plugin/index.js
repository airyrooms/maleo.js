const path = require('path');
const gulp = require('gulp');
const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const clean = require('gulp-clean');
const watch = require('gulp-watch');

const defaultBabelConfig = {
  presets: ['@babel/preset-env', '@babel/preset-react'],
  plugins: [
    '@babel/plugin-proposal-class-properties',
    [
      'module-resolver',
      {
        extensions: ['.js', '.jsx'],
        root: ['.'],
      },
    ],
    [
      '@babel/plugin-transform-runtime',
      {
        corejs: 2,
      },
    ],
  ],
};

module.exports = (paths, distDir, babelConfig = defaultBabelConfig) => {
  const tasks = Object.keys(paths);

  // clean dist folder
  gulp.task('clean', () => gulp.src(distDir + '/**').pipe(clean({ force: true })));

  tasks.map((p) => {
    const dest = path.resolve(distDir, p);

    // run transpile
    gulp.task(p, () => {
      return gulp
        .src(paths[p])
        .pipe(sourcemaps.init())
        .pipe(babel(babelConfig))
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(dest));
    });
  });

  // watch
  gulp.task('watch-development', () => {
    tasks.map((p) => paths[p] && watch(paths[p], gulp.series(p)));
  });

  gulp.task('default', gulp.series(gulp.parallel(tasks)));
  // gulp.task('default', gulp.series(tasks));
  gulp.task('watch', gulp.series('default', 'watch-development'));
};
