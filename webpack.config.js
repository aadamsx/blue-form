module.exports = {
  entry: "./src/index.js",
  output: {
    library: 'BlueForms',
    libraryTarget: 'commonjs2',
    filename: 'blue-forms.js',
    path: './lib'
  },
  devtool: 'inline-source-map',
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
  }
};
