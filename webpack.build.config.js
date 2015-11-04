var webpack = require('webpack');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var config = require('./webpack.config.js');

config.cache = false;
config.debug = false;
config.devtool = false;
config.entry = ['./index'];
config.plugins = [
  new webpack.DefinePlugin({'process.env': {NODE_ENV: '"production"'}}),
  new webpack.optimize.DedupePlugin(),
  new webpack.optimize.OccurenceOrderPlugin(),
  new webpack.optimize.UglifyJsPlugin({ compress: { warnings: false } }),
  new CopyWebpackPlugin([{ from: 'index.html', to: '../index.html' }])
];

module.exports = config;
