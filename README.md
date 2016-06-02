# Yes we canvas
YWC(Yes we canvas) is a tool for writing animation in javascript and exporting as video file easily.

# Dependencies
 - NodeJS (5.0 or later)
 - ffmpeg
 - PhantomJS

# Set Up

```
npm i -g bower webpack node-dev
npm i
bower i
npm run build
```

# How to use it

## Launch server

```bash
node server
```

## Write an animation

you can write an animation code at "animation/*.js".

## Show animation and export as video file

Open url 'http://localhost:8000' in chrome browser.

### animation.init(config)

animation.init() is called at once on beginnig of animation.

this.canvas: fabric.StaticCanvas  
this.audio: for controling audio playing.
config: animation configuration.

#### config

width: canvas width
height: canvas height
movieLength: animation length(seconds)  
frameRate: frame per second.

### animation.update(key)

animation.update() is called by every frame.

this.canvas: fabric.StaticCanvas  
key: current frame number

## writing a video file by command line.

```bash
phantomjs record.js
```

with parameter file.

```bash
phantomjs record.js test.json
```

### exmaple of parameter file 
```json:test.json
{
  "script": "sample.js",
  "params": {
    "img1": "http://example.com/image/abc.png"
  }
}

```

# License

MIT License

