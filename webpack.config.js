const path = require('path');

module.exports = () => ({
  entry: './src/index.jsx',
  output: {
    filename: 'app.min.js',
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    extensions: ['.jsx', '.js'],
    mainFields: ['module', 'browser', 'main'],

  },
  plugins: [],
  watchOptions: {
    ignored: '/node_modules/',
    poll: 1000,
  },
  devServer: {
    hot: true,
    contentBase: path.resolve(__dirname, 'dist'),
    open: false,
    port: 3000,
  },
  optimization: {
    usedExports: true,
    concatenateModules: true,
  },
  module: {
    rules: [{
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: [
          {loader: 'babel-loader'},
          // {loader: 'ts-loader', options: {transpileOnly: true}},
        ]
      }, {
        test: /\.js?$/,
        exclude: /node_modules/,
        loader: 'babel-loader?cacheDirectory',
      }
    ]
  }
});
