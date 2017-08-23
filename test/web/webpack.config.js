var path = require('path');

module.exports = {
    entry: './index.js',
    devtool: 'cheap-module-eval-source-map',
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: [
                    /node_modules/
                ],
                loader: 'babel-loader',
                options: {
                    presets: [ "es2015" ]
                }
            }
        ]
    },
    output: {
        pathinfo: true,
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js'
    },
    devServer: {
        contentBase:  path.resolve(__dirname, 'dist'),
        port: 3000
    }
};