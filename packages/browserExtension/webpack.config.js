const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

var SRC_DIR = path.resolve(__dirname, "./src");
var DIST_DIR = path.resolve(__dirname, "./dist");
var DEV_DIR = path.resolve(__dirname, "./.temp");

var buildConfig = function (env) {
    var isProd = env.prod;
    return {
        context: __dirname,
        entry: {
            background: SRC_DIR + "/background.ts",
            main: SRC_DIR + "/main.ts"
        },
        performance: {
            maxEntrypointSize: 5120000,
            maxAssetSize: 5120000
        },
        output: {
            path: DIST_DIR + "/scripts/",
            publicPath: "/scripts/",
            filename: "[name].js",
            library: "[name]",
            libraryTarget: "umd",
            devtoolModuleFilenameTemplate: isProd ? "webpack://[namespace]/[resource-path]?[loaders]" : "file:///[absolute-resource-path]",
        },
        devtool: isProd ? false : "source-map",
        resolve: {
            extensions: [".ts", ".tsx", ".js", ".scss", ".svg"],
            alias: {
                // "core": path.resolve("node_modules/@babylonjs/core"),
                // "shared-ui-components": path.resolve("node_modules/@dev/shared-ui-components"),
                // TODO. React not understood as a module
                react: path.resolve("../../node_modules/react"),
                "react-dom": path.resolve("../../node_modules/react-dom"),
            },
        },
        plugins: [
            new CopyPlugin({
              patterns: [
                { from: "./src/assets/manifest.json", to: "../manifest.json" },
              ],
            }),
          ],
        module: {
            rules: [
                {
                    test: /\.(png|svg|jpg|jpeg|gif|ttf)$/i,
                    type: "asset/inline",
                },
                {
                    test: /(?<!modules)\.s[ac]ss$/i,
                    use: [
                        "style-loader",
                        {
                            loader: "css-loader",
                            options: {
                                sourceMap: true,
                                modules: "global",
                            },
                        },
                        {
                            loader: "sass-loader",
                            options: {
                                sourceMap: true,
                            },
                        },
                    ],
                },
                {
                    test: /\.modules\.s[ac]ss$/i,
                    use: [
                        "style-loader",
                        {
                            loader: "css-loader",
                            options: {
                                sourceMap: true,
                                modules: true,
                            },
                        },
                        {
                            loader: "sass-loader",
                            options: {
                                sourceMap: true,
                            },
                        },
                    ],
                },
                {
                    test: /\.tsx?$/,
                    loader: "ts-loader",
                },
                {
                    test: /\.js$/,
                    enforce: "pre",
                    use: ["source-map-loader"],
                },
            ],
        },
        mode: isProd ? "production" : "development",
    };
};

module.exports = buildConfig;
