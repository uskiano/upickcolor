const path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/js/upickcolor.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'upickcolor.bundle.min.js',
    library: 'upickcolor',
  },
 module:{
    rules: [
        {
          test: /\.js$/,
          exclude: /(node_modules)/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          }
        }
    ]
 }
};