# Yes we canvas
YWC(Yes we canvas)はHTML5 CanvasのアニメーションをJavaScriptで記述し、ビデオファイルに書き出すためのツールです。  

# 依存関係
 - NodeJS (5.0 or later)
 - ffmpeg
 - PhantomJS

# セットアップ

```
npm i -g bower webpack node-dev
npm i
bower i
npm run build
```

# 使い方

## サーバーの起動

```bash
node server
```

## アニメーションの確認とビデオ書き出し
Chromeブラウザで 'http://localhost:8000' を開きます。

## コーディング

www/js/main.js にアニメーションの内容を記述します。  

### init(canvas,config) 
アニメーションの開始時に一度だけ呼ばれます。  
canvas: fabric.StaticCanvas  
config: アニメーション設定です。 

#### config設定値

width: 横幅を指定します  
height: 高さを指定します  
movieLength: アニメーションの秒数を指定します  
frameRate: １秒間のフレームレート(FPS)を指定します  

### update(canvas, key)
アニメーションの１フレーム毎に呼ばれます。  
canvas: fabric.StaticCanvas  
key: 現在のフレーム番号  


##コマンドラインからのビデオ書き出し

```bash
phantomjs record.js
```

#ライセンス

MIT License
