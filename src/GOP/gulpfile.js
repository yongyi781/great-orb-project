var gulp = require("gulp"),
    rimraf = require("rimraf"),
    concat = require("gulp-concat"),
    cssmin = require("gulp-cssmin"),
    rename = require("gulp-rename"),
    uglify = require("gulp-uglify");

// Order is essential here.
var engineScripts = [
    "./wwwroot/js/Engine/Enums.js",
    "./wwwroot/js/Engine/Point.js",
    "./wwwroot/js/Engine/MersenneTwister.js",
    "./wwwroot/js/Engine/AltarData.js",
    "./wwwroot/js/Engine/GopObject.js",
    "./wwwroot/js/Engine/GameAction.js",
    "./wwwroot/js/Engine/GopBoard.js",
    "./wwwroot/js/Engine/Orb.js",
    "./wwwroot/js/Engine/Player.js",
    "./wwwroot/js/Engine/GameState.js",
    "./wwwroot/js/Engine/GopCanvas.js",
    "./wwwroot/js/Engine/GameplayData.js"
];

var gopui3dScripts = "./wwwroot/js/GopUI3D/*.js";

var filesToMinify = [
    "./wwwroot/js/anglemap.js",
    "./wwwroot/js/gop.js",
    "./wwwroot/js/gopui.js",
    "./wwwroot/js/gopui3d.js",
    "./wwwroot/js/multiplayer.js",
    "./wwwroot/js/utils.js"
];

gulp.task("engine:js", () => {
    gulp.src(engineScripts)
        .pipe(concat("./wwwroot/js/gop.js"))
        .pipe(gulp.dest("."));
});

gulp.task("gopui3d:js", () => {
    gulp.src(gopui3dScripts)
        .pipe(concat("./wwwroot/js/gopui3d.js"))
        .pipe(gulp.dest("."));
});

gulp.task("min:js", () => {
    gulp.src(filesToMinify)
        .pipe(rename({ suffix: ".min" }))
        .pipe(uglify())
        .pipe(gulp.dest("./wwwroot/js/"));
});

gulp.task("default", ["engine:js", "gopui3d:js"]);
