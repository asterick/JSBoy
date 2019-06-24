const path = require("path");
const webpack = require("webpack");

const mode = process.env.NODE_ENV || "development";

module.exports = {
    mode: mode,
    entry: './src/index.jsx',
    output: {
        path: path.join(__dirname, 'public'),
        filename: 'app.js',
    },
    devServer: {
        contentBase: path.join(__dirname, 'public'),
        compress: true,
        port: 9000
    },
    plugins: [
        new webpack.IgnorePlugin(/^text-encoding$/),
        new webpack.IgnorePlugin(/^fs$/)
    ],
    module: {
        rules: [
            {
                test: /\.(png|woff|woff2|eot|ttf|svg)$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: { limit: 8196 }
                    }
                ]
            },
            {
                test: /\.s?css$/,
                use: [
                    "style-loader", // creates style nodes from JS strings
                    "css-loader", // translates CSS into CommonJS
                    "sass-loader" // compiles Sass to CSS, using Node Sass by default
                ],
            },
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: [ { loader: 'babel-loader' } ],
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.jsx', '.scss']
    }
};

if (mode !== 'production') {
    module.exports.resolve.alias = {
        inferno: __dirname + "/node_modules/inferno/dist/index.dev.esm.js"
    }
}
