var path = require('path');
var webpack = require('webpack');

var plugins = [];

/* Searches for equal or similar files and deduplicates them in the output */
plugins.push(new webpack.optimize.DedupePlugin());

/* Reduces total file size */
plugins.push(new webpack.optimize.OccurenceOrderPlugin(true));

/* Minifies the bundle */
plugins.push(new webpack.optimize.UglifyJsPlugin({minimize: true, compress: { warnings: false }}));

/* Reduce React lib size */
plugins.push(new webpack.DefinePlugin({
  'process.env': {
    'NODE_ENV': JSON.stringify('production')
  }
}));

module.exports = {
  entry: "./src/index.js",
  output: {
    filename: 'blue-form.js',
    path: path.join(__dirname, '/lib'),
    library: 'BlueForm',
    libraryTarget: 'umd'
  },
  devtool: 'source-map',
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      }
    ]
  },
  plugins: plugins,
  externals: [
    {
      react: {
        root: 'React',
        commonjs2: 'react',
        commonjs: 'react',
        amd: 'react'
      }
    }
  ],
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
