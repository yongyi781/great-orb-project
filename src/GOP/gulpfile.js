var gulp = require("gulp"),
    rimraf = require("rimraf"),
    concat = require("gulp-concat"),
    cssmin = require("gulp-cssmin"),
    rename = require("gulp-rename"),
    uglify = require("gulp-uglify"),
    project = require("./project.json");

var paths = {
    webroot: "./" + project.webroot + "/",
    emulatorScripts: [
        "./Scripts/polyfills.js",
        "./Scripts/Engine/Enums.js",
        "./Scripts/Engine/Point.js",
        "./Scripts/Engine/MersenneTwister.js",
        "./Scripts/Engine/AltarData.js",
        "./Scripts/Engine/GameAction.js",
        "./Scripts/Engine/GopBoard.js",
        "./Scripts/Engine/Orb.js",
        "./Scripts/Engine/Player.js",
        "./Scripts/Engine/GameState.js",
        "./Scripts/Engine/GopCanvas.js",
        "./Scripts/Engine/GameplayData.js"],
    scripts: ["./Scripts/*.js", "./Scripts/tests/*.js"]
};

paths.jsDest = paths.webroot + "js/";
paths.emulatorJsDest = paths.webroot + "js/gop.js";
paths.emulatorJsMinDest = paths.webroot + "js/gop.min.js";
paths.js = paths.webroot + "js/**/*.js";
paths.minJs = paths.webroot + "js/**/*.min.js";
paths.css = paths.webroot + "css/**/*.css";
paths.minCss = paths.webroot + "css/**/*.min.css";
paths.concatJsDest = paths.webroot + "js/site.min.js";
paths.concatCssDest = paths.webroot + "css/site.min.css";

gulp.task("clean:js", function (cb) {
    rimraf(paths.concatJsDest, cb);
});

gulp.task("clean:css", function (cb) {
    rimraf(paths.concatCssDest, cb);
});

gulp.task("clean", ["clean:js", "clean:css"]);

gulp.task("engine:js", function () {
    gulp.src(paths.emulatorScripts)
        .pipe(concat(paths.emulatorJsDest))
        .pipe(gulp.dest("."))
        .pipe(rename(paths.emulatorJsMinDest))
        .pipe(uglify())
        .pipe(gulp.dest("."));
});

gulp.task("copy:js", ["engine:js"], function () {
    gulp.src(paths.scripts, { base: "Scripts" }).pipe(gulp.dest(paths.jsDest));
});

gulp.task("min:js", ["engine:js"], function () {
    gulp.src([paths.js, "!" + paths.minJs], { base: "." })
        .pipe(concat(paths.concatJsDest))
        .pipe(uglify())
        .pipe(gulp.dest("."));
});

gulp.task("min:css", function () {
    gulp.src([paths.css, "!" + paths.minCss])
        .pipe(concat(paths.concatCssDest))
        .pipe(cssmin())
        .pipe(gulp.dest("."));
});

gulp.task("min", ["min:js", "min:css"]);

gulp.task("default", ["copy:js"]);
