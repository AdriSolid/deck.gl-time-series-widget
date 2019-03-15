const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const webpackBaseConfig = require('./webpack.config');

module.exports = merge(webpackBaseConfig, {
  mode: 'development',
  entry: ['react-hot-loader/patch', path.join(__dirname, '..', 'scripts', 'index')],
  output: {
    filename: '[name].[hash].js',
    chunkFilename: '[name].[hash].js',
    path: path.resolve(__dirname, '..', 'dist')
  },
  devtool: '#eval-source-map',
  devServer: {
    contentBase: path.join(__dirname, '..', 'public'),
    port: 3000,
    host: '127.0.0.1',
    historyApiFallback: true,
    hot: true
  },
  plugins: [new webpack.HotModuleReplacementPlugin(), new webpack.NamedModulesPlugin()]
});
