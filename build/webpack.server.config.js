var path = require('path');

module.exports = {
  context: __dirname + "/..",
  entry: {
    server: "./src/server/main.js"
  },

  output: {
    path: __dirname + "/../",
    // [name]はentryのキーに置換される
    filename: "[name].js"
  },

  externals: [
    {
      "socket.io": true
    }
  ],

  resolve: {
    extensions: ["", ".js", ".jsx"],
    // require()のパスを追加する
    root: path.resolve('./src/server')
  },

  module: {
    preLoaders: [
      { 
        test: /\.json$/,
        loader: 'json-loader'
      },
    ],
    loaders: [
    {
      test: /\.jsx?$/,
      exclude: /node_modules/,
      // loader: 'babel!eslint'
      loader: 'babel'
    }
    ]
  }
}

