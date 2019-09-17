const gulp = require("gulp"),
    concat = require("gulp-concat"),
    rename = require("gulp-rename"),
    terser = require("gulp-terser");

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

exports.copyAssets = function () {
    var assets = {
        lib: [
            "./node_modules/bootstrap/dist/js/bootstrap.js",
            "./node_modules/bootstrap/dist/js/bootstrap.min.js",
            "./node_modules/jquery/dist/jquery.js",
            "./node_modules/jquery/dist/jquery.min.js",
            "./node_modules/knockout/build/output/knockout-latest.debug.js",
            "./node_modules/knockout/build/output/knockout-latest.js",
            "./node_modules/stats.js/build/stats.min.js",
            "./node_modules/tone/build/Tone.js"
        ],
        css: [
            "./node_modules/bootswatch/dist/cyborg/bootstrap.css",
            "./node_modules/bootswatch/dist/cyborg/bootstrap.min.css",
            "./node_modules/bootstrap-social/bootstrap-social.css",
            "./node_modules/font-awesome/css/font-awesome.css"
        ],
        fonts: [
            "./node_modules/font-awesome/fonts/*"
        ]
    };
    for (let type of assets) {
        gulp.src(assets[type]).pipe(gulp.dest("./wwwroot/" + type));
    }
};

exports.engineJs = function () {
    return gulp.src(engineScripts)
        .pipe(concat("./wwwroot/js/gop.js"))
        .pipe(gulp.dest("."));
};

exports.gopUI3DJs = function () {
    return gulp.src(gopui3dScripts)
        .pipe(concat("./wwwroot/js/gopui3d.js"))
        .pipe(gulp.dest("."));
};

exports.minJs = function () {
    exports.engineJs();
    exports.gopUI3DJs();
    return gulp.src(filesToMinify)
        .pipe(rename({ suffix: ".min" }))
        .pipe(terser())
        .pipe(gulp.dest("./wwwroot/js"));
};

exports.signalR = function () {
    return gulp.src("./node_modules/@aspnet/signalr/dist/browser/signalr.js").pipe(gulp.dest("./wwwroot/lib"));
};
