var gulp = require("gulp"),
    concat = require("gulp-concat"),
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

gulp.task("copy-assets", function (done) {
    var assets = {
        lib: [
            "./node_modules/bootstrap/dist/js/bootstrap.js",
            "./node_modules/bootstrap/dist/js/bootstrap.min.js",
            "./node_modules/tether/dist/js/tether.js",
            "./node_modules/tether/dist/js/tether.min.js",
            "./node_modules/jquery/dist/jquery.js",
            "./node_modules/jquery/dist/jquery.min.js",
            "./node_modules/knockout/build/output/knockout-latest.debug.js",
            "./node_modules/knockout/build/output/knockout-latest.js",
            "./node_modules/stats.js/build/stats.min.js",
            "./node_modules/tone/build/Tone.js",
            "./node_modules/tone/build/Tone.min.js"
        ],
        css: [
            "./node_modules/bootswatch/cyborg/bootstrap.css",
            "./node_modules/bootswatch/cyborg/bootstrap.min.css",
            "./node_modules/bootstrap-social/bootstrap-social.css",
            "./node_modules/font-awesome/css/font-awesome.css"
        ],
        fonts: [
            "./node_modules/font-awesome/fonts/*"
        ]
    };
    for (var type in assets) {
        gulp.src(assets[type]).pipe(gulp.dest("./wwwroot/" + type));
    }
    done();
});

gulp.task("engine:js", () => {
    return gulp.src(engineScripts)
        .pipe(concat("./wwwroot/js/gop.js"))
        .pipe(gulp.dest("."));
});

gulp.task("gopui3d:js", () => {
    return gulp.src(gopui3dScripts)
        .pipe(concat("./wwwroot/js/gopui3d.js"))
        .pipe(gulp.dest("."));
});

gulp.task("min:js", gulp.parallel("engine:js", "gopui3d:js"), () => {
    return gulp.src(filesToMinify)
        .pipe(rename({ suffix: ".min" }))
        .pipe(uglify())
        .pipe(gulp.dest("./wwwroot/js/"));
});

gulp.task("signalr", () => {
    return gulp.src("./node_modules/@aspnet/signalr/dist/browser/signalr.js").pipe(gulp.dest("./wwwroot/lib"));
});

gulp.task("default", gulp.series("signalr", "min:js"));
