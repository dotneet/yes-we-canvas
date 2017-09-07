# Yes we canvas

YWC(Yes we canvas) is a tool for writing animation in javascript and exporting animation as a video file easily.

# Dependencies

 - NodeJS (8.0 or later)
 - ffmpeg
 - Chrome 60 or later

# Set Up

```
npm install
bower install
npm run build
```

# How to use it

## Launch server

```bash
npm run server
```

## Write an animation

you can write an animation script at "animation/*.js".

## Show animation and export as video file

Open the url 'http://localhost:8000' in chrome browser.

### animation.init(config)

animation.init() is called once when starting animation.

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
node record.js test.json
```

### exmaple of parameter file 

```json
{
  "script": "sample.js",
  "params": {
    "img1": "http://example.com/image/abc.png"
  }
}
```

# License

MIT License

