var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: "./src/index.js",
  output: {
    library: 'BlueForms',
    libraryTarget: 'commonjs2',
    filename: 'blue-forms.js',
    path: './lib'
  },
  devtool: 'eval',
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      }
    ]
  },
  externals: {
    react: {
      root: 'React',
      commonjs: 'react',
      commonjs2: 'react',
      amd: 'react'
    }
  },
  resolve: {
    extensions: [
      '',
      '.js'
    ],
    modulesDirectories: [
      'src',
      'node_modules'
    ]
  }
};
