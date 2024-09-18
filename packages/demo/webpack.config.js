const path = require("path");

var SRC_DIR = path.resolve(__dirname, "./src");
var DIST_DIR = path.resolve(__dirname, "./www");
var DEV_DIR = path.resolve(__dirname, "./.temp");

var buildConfig = function (env) {
    var isProd = env.prod;
    return {
        context: __dirname,
        entry: {
            index: SRC_DIR + "/app.ts",
            fhl: SRC_DIR + "/fhl.ts",
        },
        performance: {
            maxEntrypointSize: 5120000,
            maxAssetSize: 5120000
        },
        output: {
            path: (isProd ? DIST_DIR : DEV_DIR) + "/scripts/",
            publicPath: "/scripts/",
            filename: "[name].js",
            library: "[name]",
            libraryTarget: "umd",
            devtoolModuleFilenameTemplate: isProd ? "webpack://[namespace]/[resource-path]?[loaders]" : "file:///[absolute-resource-path]",
        },
        devtool: isProd ? false : "eval-cheap-module-source-map",
        devServer: {
            static: ["www"],
            // Uncomment to run over https
            server: {
                type: 'https',
                options: {
                  key: './cert/smartFilters.test.key',
                  cert: './cert/smartFilters.test.crt',
                },
              },
        },
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
