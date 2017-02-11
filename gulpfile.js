var gulp = require('gulp'),
    browserSync = require('browser-sync'),
    htmlreplace = require('gulp-html-replace'),
    path = require('path'),
    swPrecache = require('sw-precache'),
    cleanCSS = require('gulp-clean-css'),
    concatCss = require('gulp-concat-css'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    htmlmin = require('gulp-htmlmin'),
    htmlbuild = require('gulp-htmlbuild');

gulp.task('default', function() {

});

gulp.task('pages', function() {
  gulp.src(['app/pages/**/*'])
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('dist/pages'));
});

gulp.task('minify-css', function() {
  return gulp.src(['http://fonts.googleapis.com/css?family=Lato:300,400,700,300italic,400italic',
                   'bower_components/font-awesome/css/font-awesome.min.css',
                   'app/styles/bootstrap.css',
                   'app/styles/ui.css',
                   'app/styles/main.css',
                   'app/styles/my-style.css'])
    .pipe(concatCss('styles-1.0.3.min.css'))
    .pipe(cleanCSS())
    .pipe(gulp.dest('dist/css'));

});

gulp.task('json', function() {
  gulp.src(['app/gtfs/agency.json',
            'app/gtfs/stops.json',
            'app/gtfs/stop_times.json'])
      .pipe(gulp.dest('dist/gtfs'));
});

gulp.task('images', function() {
  gulp.src(['app/images/**/*'])
      .pipe(gulp.dest('dist/images'));
});

gulp.task('fonts', function() {
  gulp.src(['bower_components/font-awesome/fonts/**/*'])
      .pipe(gulp.dest('dist/fonts'));
});

gulp.task('compress', function() {
  return gulp.src(['bower_components/jquery/dist/jquery.min.js',
                  'bower_components/angular/angular.min.js',
                  'bower_components/angular-route/angular-route.min.js',
                  'bower_components/angular-aria/angular-aria.min.js',
                  'bower_components/angular-animate/angular-animate.min.js',
                  'bower_components/firebase/firebase.js',
                  'bower_components/angularfire/dist/angularfire.js',
                  'bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js',
                  'bower_components/idbwrapper/idbstore.min.js',
                  'app/app.js',
                  'app/app.routes.js',
                  'app/app.config.js',
                  'app/controllers/*.js',
                  'app/factories/*.js'])
    //.pipe(uglify())
    .pipe(concat('scripts-1.0.6.min.js'))
    .pipe(gulp.dest('dist/js'));
});

gulp.task('serve', function() {
    browserSync.init({
        server: {
            baseDir: ["app"],
            index: "index.html",
            routes: {
                "/bower_components": "bower_components"
            }
        },
        browser: "google chrome canary"
    });

    console.log('## server started ##');

    gulp.watch('dev/**/*').on('change', browserSync.reload);
    gulp.watch('app/**/*').on('change', browserSync.reload);

    gulp.watch('src/js/**/*.js').on('change', function(event) {
        console.log("Linting " + event.path);
        gulp.src(event.path)
            .pipe(jshint())
            .pipe(jshint.reporter(jshintStylish));
    });
});

gulp.task('serve:dist', function() {
    browserSync.init({
        server: {
            baseDir: ["dist"],
            index: "index.html"
        }
    });

    console.log('## production server started ##');
});

gulp.task('generate-sw-dev', function(callback) {
  var rootDir = 'app';

  swPrecache.write(path.join(rootDir, 'service-worker.js'), {
    // staticFileGlobs: [rootDir + '/**/*.{js,html,css,png,jpg,gif,ico,ttf,woff,woff2,eot,svg}',
    staticFileGlobs: [rootDir + '/**/*.{js,html,css,png,jpg,gif,ico}',
                     'bower_components/font-awesome/**/*',
                     'bower_components/bootstrap/dist/css/bootstrap.min.css',
                     'bower_components/jquery/dist/jquery.min.js',
                     'bower_components/angular/angular.min.js',
                     'bower_components/angular-route/angular-route.min.js',
                     'bower_components/angular-aria/angular-aria.min.js',
                     'bower_components/angular-animate/angular-animate.min.js',
                     'bower_components/firebase/firebase.js',
                     'bower_components/angularfire/dist/angularfire.js',
                     'bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js',
                     'bower_components/idbwrapper/idbstore.min.js',
                     'bower_components/font-awesome/fonts/fontawesome-webfont.woff2',
                     'bower_components/font-awesome/fonts/fontawesome-webfont.woff',
                     'bower_components/font-awesome/fonts/fontawesome-webfont.ttf',
                     'bower_components/bootstrap/dist/fonts/glyphicons-halflings-regular.woff2',
                     'bower_components/bootstrap/dist/fonts/glyphicons-halflings-regular.woff',
                     'bower_components/bootstrap/dist/fonts/glyphicons-halflings-regular.ttf'],
    stripPrefix: rootDir
  }, callback);
});

gulp.task('generate-sw-dist', function(callback) {
  var rootDir = 'dist';

  swPrecache.write(path.join(rootDir, 'service-worker.js'), {
    staticFileGlobs: [rootDir + '/**/*.{js,html,css,png,jpg,gif,ico,ttf,woff,woff2,eot,svg}'],
    stripPrefix: rootDir
  }, callback);
});

gulp.task('server', ['serve']);
gulp.task('dist', ['minify-css', 'compress', 'pages', 'json', 'fonts', 'images']);

//TODO htmlbuild
gulp.task('build', function () {

  gulp.src(['dist/index.html'])
    .pipe(htmlbuild({
      // build js with preprocessor
      js: htmlbuild.preprocess.js(function (block) {

        block.pipe(gulpSrc())
          .pipe(jsBuild);

        block.end('js/concat.js');

      }),

      // build css with preprocessor
      css: htmlbuild.preprocess.css(function (block) {

        block.pipe(gulpSrc())
          .pipe(cssBuild);

        block.end('css/concat.css');

      }),

      // remove blocks with this target
      remove: function (block) {
        block.end();
      },

      // add a template with this target
      template: function (block) {
        es.readArray([
          '<!--',
          '  processed by htmlbuild (' + block.args[0] + ')',
          '-->'
        ].map(function (str) {
          return block.indent + str;
        })).pipe(block);
      }
    }))
    .pipe(gulp.dest('./build'));

});
