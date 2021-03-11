const webpack = require('webpack');
const path = require('path');


const IS_DEVELOP = true;

const config = {
    mode: IS_DEVELOP ? 'development': 'production',
    context: path.join(__dirname, 'src'),
    devtool: 'inline-source-map',
    devServer: {
        historyApiFallback: true
    },
    entry: './index.tsx',
    output: {
        path: path.join(__dirname, 'dist'),
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
            path: require.resolve("path-browserify")
        },
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
        fallback: {
            "fs": false
        }
    },
    plugins: [
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
        })
    ]
}

module.exports = [
    config
];