const path   = require('path');
const Terser = require('terser-webpack-plugin');

module.exports = {
    mode         : 'production',
    entry        : {
        sdk : ['./src/index.ts']
    },
    module: {
        rules: [
            {
                test    : /\.ts?$/,
                use     : 'ts-loader',
                exclude : /node_modules/,
            }
        ],
    },
    resolve: {
        extensions: [ '.tsx', '.ts', '.js' ],
    },
    output       : {
        path          : path.resolve(__dirname, 'dist'),
        filename      : 'poke.min.js',
        library       : 'poke', // The library name
        libraryTarget : 'umd'
    }, 
    optimization : /^production$/.test(MODE) ? {
        minimizer: [
          new Terser() // Uglify with support to ES6
        ]
    } : {}
}