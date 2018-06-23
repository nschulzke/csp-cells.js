var path = require('path');
var webpack = require('webpack');
module.exports = env => {
  env = env || {};
  return {
    entry: ['babel-polyfill', './src/index.js'],
    devtool: 'sourcemap',
    mode: env.prod
      ? 'production'
      : 'development',
    output: {
      path: path.resolve(__dirname, 'public'),
      filename: 'bundle.js'
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          loader: 'babel-loader',
          query: {
            presets: ['env']
          }
        }
      ]
    },
    stats: {
      colors: true
    },
  }
};
