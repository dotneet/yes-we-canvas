var path = require('path');

module.exports = {
  context: __dirname + "/..",
  entry: {
    bundle: "./src/client/app.js"
  },

  output: {
    path: __dirname + "/../www/js",
    // publicPathにJavaScriptの出力先に対応したURLのパスを指定しておくことで
    // webpack-dev-serverがホットリロードしてくれるようになる
    publicPath: '/js/',
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
    root: path.resolve('./src/client')
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
    },
    {
      test: /\.vue$/,
      loader: 'vue'
    }, {
      test: /\.scss$/,
      loader: 'style!css!sass?sourceMap'
    }]
  },
  vue: {
    loaders: {
      // js: 'babel!eslint'
      js: 'babel'
    }
  }

}

