import * as path from 'path';
import { Configuration, ProvidePlugin } from 'webpack';

const IS_DEVELOP = true;

const config: Configuration = {
    mode: IS_DEVELOP ? 'development': 'production',
    context: path.join(__dirname, 'src'),
    devtool: 'inline-source-map',
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
        new ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
        })
    ]
}

export default config;
