const webpack = require('webpack');
const path = require('path');
const Dotenv = require('dotenv-webpack')

const IS_LOCAL = false;
const IS_DEVELOP = true;

const outputPath = IS_LOCAL ? path.join(__dirname, 'dist') : path.join(path.resolve(__dirname, '..'), 'static', 'dist')

const config = {
    mode: IS_DEVELOP ? 'development': 'production',
    context: path.join(__dirname, 'src'),
    devtool: 'inline-source-map',
    devServer: {
        historyApiFallback: true
    },
    entry: './index.tsx',
    output: {
        path: outputPath,
        filename: 'bundle.js',

    },
    module: {
        rules: [
            {
                test: /\.(ts|tsx|js|jsx)$/,
                exclude: /node_modules/,
                loader: 'ts-loader',
            },
            {
                enforce: 'pre',
                test: /\.tsx?$/,
                use: [
                    {
                        loader: 'tslint-loader',
                        options: {
                            typeCheck: true,
                            fix: true,
                        }
                    }
                ]
            }
        ],
    },
    resolve: {
        alias: {
            path: require.resolve("path-browserify"),
            process: "process/browser"
        },
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
        fallback: {
            "fs": false
        }
    },
    plugins: [
        new Dotenv(),
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
        }),
        new webpack.ProvidePlugin({
            process: 'process/browser'
        }),
    ]
}

module.exports = [
    config
];
