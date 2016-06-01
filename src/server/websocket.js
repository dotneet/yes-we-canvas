'use strict';

var fs = require('fs');
var child_process = require('child_process')
var util = require('util')
var glob = require("glob")

module.exports = function (io, serverConfig) {
  const outputDir = serverConfig.outputDir
  const wwwDir = serverConfig.wwwDir

  var frameRate = 30;
  var recvImageFormat = null;

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

  io.on('connection', function(socket){
    console.log('a user connected');
    var recordIndex = 0;

    socket.on('start_record', function(data, cb) {
      console.log('start_record')
      recordIndex = 0;
      recvImageFormat = data.format;
      frameRate = data.frameRate;

      fs.exists(outputDir, (exists) => {
        if ( exists ) {
          var ext = mimeTypeToExtension(recvImageFormat)
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
        var name = outputDir + '/' + recordIndex + "." + mimeTypeToExtension(recvImageFormat);
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

    socket.on('create_movie', function(data,cb) {
      var ext = mimeTypeToExtension(recvImageFormat);
      var inputField = util.format('%s/%%d.%s', outputDir, ext)
      var ffmpegCmd = serverConfig.ffmpegCmd
      var cmd = util.format('%s -y -r %d -i %s -r %d %s/output.mp4', ffmpegCmd, frameRate, inputField, frameRate, wwwDir)
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
    });
  });
}

