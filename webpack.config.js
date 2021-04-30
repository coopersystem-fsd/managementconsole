var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var dllManifest = require('./dll/vendor-manifest.json');

var VERSION = require('./package').version;
var NODE_ENV = process.env.NODE_ENV || 'development';
var BUILD_NUMBER = process.env.BUILD_NUMBER;
var GIT_COMMIT = process.env.GIT_COMMIT;
var GIT_BRANCH = process.env.GIT_BRANCH;

console.log('NODE_ENV: ', NODE_ENV);

var plugins = [

  new webpack.DefinePlugin({
    NODE_ENV: JSON.stringify(NODE_ENV),
    BUILD_NUMBER: JSON.stringify(BUILD_NUMBER),
    GIT_COMMIT: JSON.stringify(GIT_COMMIT),
    GIT_BRANCH: JSON.stringify(GIT_BRANCH),
    VERSION: JSON.stringify(VERSION),
  }),

  new webpack.ProvidePlugin({
    moment: 'moment',
    _: 'lodash',
  }),

  new HtmlWebpackPlugin({
    filename: 'index.html',
    template: path.join(__dirname, 'template', 'index.ejs'),
  }),

  new webpack.DllReferencePlugin({
    context: path.join(__dirname, 'src'),
    manifest: dllManifest,
  }),
];

var output = {
  path: path.join(__dirname, 'dist'),
  publicPath: '/',
  filename: '[name].[hash].js', 
};

var devtool = 'cheap-module-eval-source-map';

switch (NODE_ENV) {
  case 'production':
    devtool = false;
    plugins = plugins.concat([
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          dead_code: true,
          drop_console: true,
          screw_ie8: true,
        },
      }),
    ]);
    break;
  case 'development':
    plugins = plugins.concat([
      new webpack.NoEmitOnErrorsPlugin(),
      new webpack.NamedModulesPlugin(),
    ]);
    break;
  case 'hmr':
  case 'test':
    output = {
      path: path.join(__dirname),
      filename: '[name].js',
      publicPath: '/',
    };

    plugins = plugins.concat([
      new webpack.NoEmitOnErrorsPlugin(),
      new webpack.NamedModulesPlugin(),
    ]);
    break;
  default:
    throw new Error(`Unsupported env ${NODE_ENV}`);
}

module.exports = {

  cache: true,

  context: path.join(__dirname, 'src'),

  entry: {
    main: path.join(__dirname, 'src', 'index.js'),
    dll: path.join(__dirname, 'dist', 'dll.vendor.js'),
  },

  devtool: devtool,

  output: output,

  plugins: plugins,

  devServer: {
    port: 3000,
    host: '0.0.0.0',
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        enforce: 'pre',
        loader: 'eslint-loader',
        exclude: /node_modules/,
        include: path.join(__dirname, 'src'),
        options: {
          emitWarning: true,
          emitError: true,
        },
      },
      {
        test: /\.js$/,
        use: 'babel-loader',
        include: path.join(__dirname, 'src'),
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
      {
        test: /\.(png|jpg|gif|html|svg|ttf|woff|eot)$/,
        loader: 'file-loader',
      },
      {
        test: /\.json$/,
        use: 'json-loader',
      },
    ],
  },
  resolve: {
    modules: [
      path.join(__dirname, 'src'),
      'node_modules',
    ],
  },
};
