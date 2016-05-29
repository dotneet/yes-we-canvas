var config = require('./webpack.base.config')

config.devtool = 'eval-source-map'

config.devServer = {
  // ビルド内容などの詳細の出力を抑えるかを指定する
  noInfo: false,
  // HTTPステータス404の場合にindex.htmlを返してくれる
  historyApiFallback: {
    index: '/index.html'
  }
}

module.exports = config

