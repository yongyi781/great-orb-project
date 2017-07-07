const CheckerPlugin = require('awesome-typescript-loader').CheckerPlugin;

module.exports = {
    entry: "./Scripts/test.ts",
    resolve: { extensions: ['.js', '.ts'] },
    output: {
        filename: "./wwwroot/js/bundle.js"
    },
    module: {
        loaders: [
            {
                test: /\.tsx?$/,
                loader: "awesome-typescript-loader"
            }
        ]
    },
    plugins: [
        new CheckerPlugin()
    ]
}
