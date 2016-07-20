/// <binding AfterBuild='default' />
var gulp = require("gulp"),
    rimraf = require("rimraf"),
    concat = require("gulp-concat"),
    cssmin = require("gulp-cssmin"),
    rename = require("gulp-rename"),
    uglify = require("gulp-uglify");

var paths = {
    webroot: "./wwwroot/",
    emulatorScripts: [
        "./wwwroot/js/polyfills.js",
        "./wwwroot/js/Engine/Enums.js",
        "./wwwroot/js/Engine/Point.js",
        "./wwwroot/js/Engine/MersenneTwister.js",
        "./wwwroot/js/Engine/AltarData.js",
        "./wwwroot/js/Engine/GameAction.js",
        "./wwwroot/js/Engine/GopBoard.js",
        "./wwwroot/js/Engine/Orb.js",
        "./wwwroot/js/Engine/Player.js",
        "./wwwroot/js/Engine/GameState.js",
        "./wwwroot/js/Engine/GopCanvas.js",
        "./wwwroot/js/Engine/GameplayData.js"],
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
    //gulp.src(paths.scripts, { base: "Scripts" }).pipe(gulp.dest(paths.jsDest));
});

gulp.task("default", ["engine:js"]);
