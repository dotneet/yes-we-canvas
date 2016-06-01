'use strict';

var gulp = require('gulp');
var plumber = require('gulp-plumber');
var notify = require('gulp-notify');
var webpack = require('webpack-stream');
var _ = require('lodash');

// ソースの更新を検知してwebpackを実行する
gulp.task('default', ['watch'], function() {
});

// webpackを実行する
gulp.task('update', ['update'], function() {
});

gulp.task('update', function() {
  return gulp.src('src/client/app.js')
    .pipe(plumber({errorHandler: notify.onError('<%= error.message %>')}))
    .pipe(webpack(require('./build/webpack.dev.config.js')))
    .pipe(gulp.dest('www/js/'))
});

gulp.task('watch', function() {
  return gulp.src('src/client/app.js')
    .pipe(plumber({errorHandler: notify.onError('<%= error.message %>')}))
    .pipe(webpack(_.merge(require('./build/webpack.dev.config.js'), {watch: true})))
    .pipe(gulp.dest('www/js/'))
});

