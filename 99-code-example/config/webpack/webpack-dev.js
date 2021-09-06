const { merge } = require('webpack-merge');
const base = require('./webpack-base');
const helpers = require('./webpack-helpers');

module.exports = merge(base, {
  mode: 'development',
  devtool: 'inline-source-map',
  output: {
    path: helpers.resolveFromRootPath('dist'),
    filename: '[name].js',
  },
  devServer: {
    inline: true,
    host: 'localhost',
    port: 8080,
    stats: 'minimal',
    hot: true,
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
  plugins: [],
  module: {
    rules: [
      {
        test: /\.(png|jpg|gif|svg|ico)$/,
        loader: 'file-loader',
        options: {
          name: 'img/[name].[ext]',
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
});
