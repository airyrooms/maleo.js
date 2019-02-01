const path = require('path');
const gulp = require('gulp');
const babel = require('gulp-babel');
const clean = require('gulp-clean');
const watch = require('gulp-watch');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');

// DECLARATION
const distDir = 'lib';
const paths = {
  interfaces: 'src/interfaces/**/**',
  utils: 'src/utils/**',
  constants: 'src/constants/*.ts',
  build: 'src/build/**',
  lib: 'src/lib/*.ts',
  render: 'src/render/**',
  server: 'src/server/**',
  client: 'src/client/**',
  bin: 'src/bin/*.ts',
  routes: 'src/routes/**',
  default: 'src/default/*.ts',
};

let tasks = Object.keys(paths);

// TASKS
tasks.map((p) => {
  const dest = path.resolve(distDir, p);

  gulp.task(p, () =>
    gulp
      .src(paths[p])
      .pipe(sourcemaps.init())
      .pipe(babel())
      // .pipe(uglify())
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest(dest)),
  );
});

gulp.task('clean', () => gulp.src(distDir + '/**').pipe(clean({ force: true })));

// RUNNER
gulp.task('default', gulp.series(gulp.parallel(tasks)));

gulp.task('watch-development', () => {
  tasks.map((p) => paths[p] && watch(paths[p], gulp.series(p)));

  watch('./babel.config.js', gulp.series(tasks));
  watch('./tsconfig.json', gulp.series(tasks));
});

gulp.task('watch', gulp.series('default', 'watch-development'));
