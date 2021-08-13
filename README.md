# Yes we canvas

YWC(Yes we canvas) is a tool for writing animation in javascript and exporting animation as a video file easily.

# Dependencies

 - NodeJS (8.0 or later)
 - Chrome 61 or later
 - ffmpeg

# Set Up

```
yarn install
yarn run build
```

# How to use it

## Launch server

```bash
npm start
```

Open the url 'http://localhost:8100' with chrome browser.

## Write an animation

You can write an animation script at the animation directory.
three.js can be used to rendering an object.
three.js provide an ability to write both 2d and 3d animation with YWC.
Please read animation/sample.js to know what you can do in this product.

## Show animation and export as a video file

Open the url 'http://localhost:8100' with chrome browser.

### animation.init(config)

animation.init() is called once when starting animation.

this.audio: for controling audio playing.
this.three: three utility
config: animation configuration.

#### config

width: canvas width
height: canvas height
movieLength: animation length(seconds)  
frameRate: frame per second.

### animation.update(key)

animation.update() is called by every frame.

key: current frame number

## writing a video file by command line.

```bash
node src/command/record.js exmaples/param_example1.json
```

### exmaple of parameter file 

```json
{
  "script": "sample.js",
  "output": "www/output.mp4",
  "params": {
    "img1": "http://example.com/image/abc.png"
  }
}
```

`output` property supports also AWS S3.
For example, you set 's3://yorubucket/output.mp4' to `output` property, output is uploaed to S3 bucket.
Credentials for S3 must be stored in .aws directory on your home directory.

# License

MIT License

