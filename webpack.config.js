let path = require('path');

const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

let webpackConfig = {
    mode: 'production',
    entry: {
        html_freeform: './src/visualizations/html_freeform.js'
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, './dist'),
        // library: '[name]',
        // libraryTarget: 'umd'
    },
    resolve: {
        extensions: ['.ts', '.js', '.scss', '.css']
    },
    plugins: [
        new UglifyJSPlugin(),
    ],
    module: {
        rules: [
            { test: /\.ts$/, loader: 'ts-loader' },
            { test: /\.css$/, loader: ['to-string-loader', 'css-loader'] },
            { test: /\.(woff|woff2)$/,
                use: {
                    loader: 'url-loader',
                },
            }
        ],
    },
    devServer: {
        host: 'localhost',
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': '*',
        },
        disableHostCheck: true,
        contentBase: false,
        compress: true,
        port: 8443,
        https: true
    },
    devtool: 'eval',
    watch: true
};

module.exports = webpackConfig;

// const path = require('path')

// module.exports = {
//     mode: 'production',
//     entry: {
//         'html_freeform': path.resolve(
//             __dirname,
//             './src/visualizations/html_freeform.js'
//         ),
//     },
//     output: {
//         filename: '[name].js',
//         path: path.resolve(__dirname, './dist'),
//     },
//     module: {
//         rules: [
//             { test: /\.ts|.tsx$/, loader: 'ts-loader' },
//             {
//                 test: /\.css$/,
//                 use: ['style-loader', 'css-loader'],
//             },
//         ],
//     },
//     resolve: {
//         extensions: ['.ts', '.tsx', '.js'],
//     },
// }