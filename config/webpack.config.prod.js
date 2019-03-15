const webpack = require('webpack');
const merge = require('webpack-merge');
const webpackBaseConfig = require('./webpack.config');
const Uglify = require("uglifyjs-webpack-plugin");

module.exports = merge(webpackBaseConfig, {
  mode: 'production',
  devtool: 'source-map',
  plugins: [new webpack.HashedModuleIdsPlugin(), new Uglify()]
});
