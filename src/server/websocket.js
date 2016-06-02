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


module.exports = function (io, serverConfig) {
  const outputDir = serverConfig.outputDir
  const wwwDir = serverConfig.wwwDir

  var recordContext = {
    frameRate: 30,
    length: null,
    imageFormat: null,
    sound: null
  }

  function clearRecordContext() {
  }

  io.on('connection', function(socket){
    console.log('connected');
    var recordIndex = 0;

    socket.on('start_record', function(data, cb) {
      console.log('start_record')
      recordIndex = 0;
      recordContext.imageFormat = data.format;
      recordContext.frameRate = data.frameRate;
      recordContext.movieLength = data.movieLength;

      fs.exists(outputDir, (exists) => {
        if ( exists ) {
          var ext = mimeTypeToExtension(recordContext.imageFormat)
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
      recordIndex++;
      if ( Buffer.isBuffer(data) ) {
        var name = outputDir + '/' + recordIndex + "." + mimeTypeToExtension(recordContext.imageFormat);
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
          recordContext.sound = cmd.src
        }
      })
      next()
    })

    socket.on('create_movie', function(data,cb) {
      if ( recordContext.sound !== null ) {
        var url = recordContext.sound
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
    var ext = mimeTypeToExtension(recordContext.imageFormat);
    var inputField = util.format('%s/%%d.%s', outputDir, ext)
    var ffmpegCmd = serverConfig.ffmpegCmd
    var fps = recordContext.frameRate
    var soundArgs = ''
    if ( soundFile !== null ) {
      soundArgs = util.format(' -i %s -t ', soundFile, recordContext.movieLength)
    }
    var cmd = util.format('%s -y -r %d -i %s %s -r %d %s/output.mp4', ffmpegCmd, fps, inputField, soundArgs, fps, wwwDir)
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

