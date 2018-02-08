var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var sass = require('gulp-sass');
var cleancss = require('gulp-clean-css');
var csscomb = require('gulp-csscomb');
var rename = require('gulp-rename');
var autoprefixer = require('gulp-autoprefixer');
var sourcemaps = require('gulp-sourcemaps');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var fs = require("fs");

var paths = {
    pages: ['./src/**/*.html'],
    styles: ['./src/sass/**/*.scss'],
    styles2: ['./src/css/**/*.css'],
    scripts: ['./src/**/*.js']
};

gulp.task("watch", function() {
    gulp.watch(paths.pages, ["html"]);
    gulp.watch(paths.styles, ["styles"]);
    gulp.watch(paths.styles2, ["styles2"]);
    gulp.watch(paths.scripts, ["scripts"]);
});

gulp.task("html", function() {
    gulp.src(paths.pages)
        .pipe(gulp.dest("./build/"));
});


gulp.task("styles", function() {
    gulp.src(paths.styles)
        .pipe(sass({ outputStyle: 'compact', precision: 10 })
            .on('error', sass.logError)
        )
        .pipe(autoprefixer())
        .pipe(csscomb())
        .pipe(cleancss())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('./build/css/'));
});

gulp.task("styles2", function() {
    gulp.src(paths.styles2)
        .pipe(autoprefixer())
        .pipe(csscomb())
        .pipe(cleancss())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('./build/css/'));
});

gulp.task("scripts", function() {
    let autoClasser = false;
    var ClassesArr = ClassesArr = ["Class", "MovingObject", "Bullet", "Player", "Enemy"];
    if (autoClasser)
        ClassesArr = fs.readdirSync("./src/Classes/");

    console.info("autoClasser " + (autoClasser ? "enabled" : "disabled"));

    let classesStr = ``;
    for (var i = 0; i < ClassesArr.length; i++) {
        let c = ClassesArr[i];
        // console.log(i, c);

        classesStr += `require("./Classes/` + c + (autoClasser ? `` : `.js`) + `");\n`;
    }

    fs.writeFileSync("./src/classes.js", classesStr);

    browserify({
            basedir: ".",
            debug: true,
            entries: ["./src/main.js"],
            cache: {},
            packageCache: {},
            insertGlobals: true
        })
        .on("error", (...err) => {
            console.error("ERROR", err);
        })
        .bundle()
        .on("error", (...err) => {
            console.error("ERROR", err);
        })
        .pipe(source("bundle.js"))
        .pipe(buffer())
        .pipe(sourcemaps.init({ loadMaps: true }))
        // .pipe(uglify())
        .pipe(sourcemaps.write("./"))
        .pipe(gulp.dest("./build/js/"));
});

gulp.task("default", ["scripts", "styles", "styles2", "html", "watch"]);
gulp.task("build", ["scripts", "styles", "styles2", "html"]);