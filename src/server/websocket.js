'use strict';

var fs = require('fs');
var http = require('http');
var child_process = require('child_process')
var util = require('util')
var glob = require("glob")

function mimeTypeToExtension(mimeType) {
  switch ( mimeType ) {
    case 'image/jpeg':
    case 'image/jpg':
      return 'jpeg'
    case 'image/png':
      return 'png'
    case 'image/webp':
      return 'webp'
  }
}

function download(url, path, callback) {
  var file = fs.createWriteStream(path);
  var request = http.get(url, function(response) {
    response.pipe(file);
    response.on('end', function() {
      callback(file)
    })
  });
}

var RecordingContext = function (config) {
  this.serverConfig = config
  this.index = 0

  this.options = {
    frameRate: 30,
    movieLength: null,
    imageFormat: null,
    videoFormat: 'mpg',
    sound: null,
    outputPath: null
  }
}

RecordingContext.prototype.getOutputPath = function () {
  if ( this.options['outputPath'] === null ) {
    return this.serverConfig.wwwDir + '/output.' + this.options.videoFormat
  } else {
    return this.options['outputPath']
  }
}


module.exports = function (io, serverConfig) {
  const outputDir = serverConfig.outputDir
  const wwwDir = serverConfig.wwwDir

  var context = new RecordingContext(serverConfig)

  io.on('connection', function(socket){
    console.log('connected');

    socket.on('start_record', function(data, cb) {
      console.log('start_record')
      context = new RecordingContext(serverConfig)
      for (var attrname in data.options ) { 
        if ( data.options[attrname] !== null ) {
          context.options[attrname] = data.options[attrname];
        }
      }
      if ( data.batchParams !== null ) {
        if ( data.batchParams.output !== undefined ) {
          context.options.outputPath = data.batchParams.output
        }
      }

      fs.exists(outputDir, (exists) => {
        if ( exists ) {
          var ext = mimeTypeToExtension(context.options.imageFormat)
          glob(outputDir + "/*." + ext, null, (er,files)=>{
            files.forEach((f)=>{
              fs.unlink(f)
            })
            cb()
          });
        } else {
          fs.mkdir(outputDir, (err) => {
            cb()
          })
        }
      })
    });

    socket.on('record', function(data,cb) {
      context.index++;
      if ( Buffer.isBuffer(data) ) {
        var name = outputDir + '/' + context.index + "." + mimeTypeToExtension(context.options.imageFormat);
        fs.writeFile(name, data, function(err) {
          if ( err != null ) {
            console.log(err);
          } else {
            process.stdout.write('.')
            cb();
          }
        });
      } else {
        console.log('found a incorrect data type: ' + typeof(data));
      }
    });

    socket.on('set_sound', function(data, next) {
      data.commands.forEach((cmd) => {
        if ( cmd.name === "source" ) {
          console.log('set sound source:' + cmd.src)
          context.options.sound = cmd.src
        }
      })
      next()
    })

    socket.on('create_movie', function(data,cb) {
      console.log(context.options)
      if ( context.options.sound !== null ) {
        var url = context.options.sound
        if ( url.indexOf('http://') !== -1 || url.indexOf('https://') !== -1 ) {
          var soundOutputPath = util.format('%s/download.mp3', outputDir)
          console.log('download from: ' + url)
          download(url, soundOutputPath, () => {
            createMovie(cb, soundOutputPath)
          })
        } else {
          createMovie(cb, wwwDir + '/' + url)
        }
      } else {
        createMovie(cb, null)
      }
    })
  })

  function createMovie(cb, soundFile) {
    var ext = mimeTypeToExtension(context.options.imageFormat);
    var inputField = util.format('%s/%%d.%s', outputDir, ext)
    var ffmpegCmd = serverConfig.ffmpegCmd
    var fps = context.options.frameRate
    var soundArgs = ''
    if ( soundFile !== null ) {
      soundArgs = util.format(' -i %s -t ', soundFile, context.options.movieLength)
    }
    var cmd = util.format('%s -y -r %d -i %s %s -r %d ', ffmpegCmd, fps, inputField, soundArgs, fps, context.getOutputPath())
    console.log("")
    console.log(cmd)
    child_process.exec(cmd,{},(err,stdout,stderr) => {
      if ( stdout != null ) {
        console.log(stdout)
      }
      if ( stderr != null ) {
        console.log(stderr)
      }
      cb(err,stdout,stderr)
    })
  }
}

