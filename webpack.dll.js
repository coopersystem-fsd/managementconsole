var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: {
    vendor: [path.join(__dirname, 'vendors.js')],
  },
  output: {
    path: path.join(__dirname, 'dist'),
    publicPath: '/',
    filename: 'dll.[name].js',
    library: '[name]',
  },
  plugins: [
    new webpack.DllPlugin({
      path: path.join(__dirname, 'dll', '[name]-manifest.json'),
      name: '[name]',
      context: path.resolve(__dirname),
    }),
    new webpack.optimize.UglifyJsPlugin(),
  ],
  module: {
    loaders: [
      {
        test: /\.json$/,
        loaders: ['json-loader'],
      },
    ],
  },
  resolve: {
    modules: [
      path.join(__dirname),
      'node_modules',
    ],
  },
};
