var gulp = require('gulp');

gulp.task('default', function() {
  // place code for your default task here

});

var uglify = require('gulp-uglify');

gulp.task('compress', function() {
  gulp.src('js/lib/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('js/exp'));
});
