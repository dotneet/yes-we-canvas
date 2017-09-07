'use strict'

const fs = require('fs')
const http = require('http')
const childProcess = require('child_process')
const util = require('util')
const glob = require('glob')

function clone (obj) {
  if (obj === null || typeof obj !== 'object') return obj
  let copy = obj.constructor()
  for (let attr in obj) {
    if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr]
  }
  return copy
}

function mimeTypeToExtension (mimeType) {
  switch (mimeType) {
    case 'image/jpeg':
    case 'image/jpg':
      return 'jpeg'
    case 'image/png':
      return 'png'
    case 'image/webp':
      return 'webp'
  }
}

function download (url, path, callback) {
  let file = fs.createWriteStream(path)
  let request = http.get(url, function (response) {
    response.pipe(file)
    response.on('end', function () {
      callback(file)
    })
  })
}

let RecordingContext = function (config) {
  this.serverConfig = config
  this.index = 0

  this.options = {
    frameRate: 30,
    movieLength: null,
    imageFormat: null,
    videoFormat: 'mpg',
    sounds: [],
    outputPath: null
  }
}

RecordingContext.prototype.getOutputPath = function () {
  if (this.options['outputPath'] === null) {
    return this.serverConfig.wwwDir + '/output.' + this.options.videoFormat
  } else {
    return this.options['outputPath']
  }
}

module.exports = function (io, serverConfig) {
  const outputDir = serverConfig.outputDir
  const wwwDir = serverConfig.wwwDir

  let context = new RecordingContext(serverConfig)

  io.on('connection', function (socket) {
    console.log('connected')

    socket.on('start_record', function (data, cb) {
      console.log('start_record')
      context = new RecordingContext(serverConfig)
      for (let attrname in data.options) {
        if (data.options[attrname] !== null) {
          context.options[attrname] = data.options[attrname]
        }
      }
      if (data.batchParams !== null) {
        if (data.batchParams.output !== undefined) {
          context.options.outputPath = data.batchParams.output
        }
      }

      fs.exists(outputDir, (exists) => {
        if (exists) {
          let ext = mimeTypeToExtension(context.options.imageFormat)
          glob(outputDir + '/*.' + ext, null, (er, files) => {
            files.forEach((f) => {
              fs.unlink(f)
            })
            cb()
          })
        } else {
          fs.mkdir(outputDir, (err) => {
            cb()
          })
        }
      })
    })

    socket.on('record', function (data, cb) {
      context.index++
      if (Buffer.isBuffer(data)) {
        let name = outputDir + '/' + context.index + '.' + mimeTypeToExtension(context.options.imageFormat)
        fs.writeFile(name, data, function (err) {
          if (err !== null) {
            console.log(err)
          } else {
            process.stdout.write('.')
            cb()
          }
        })
      } else {
        console.log('found a incorrect data type: ' + typeof(data))
      }
    })

    socket.on('set_sound', function (data, next) {
      let sounds = []
      data.commands.forEach((cmd) => {
        if (cmd.name === 'play') {
          sounds[cmd.src] = cmd
        }
        if (cmd.name === 'pause') {
          if (sounds.hasOwnProperty(cmd.src)) {
            sounds[cmd.src].end_key = cmd.key
            sounds[cmd.src].sound_length = cmd.key - sounds[cmd.src].key
          }
        }
      })
      Object.keys(sounds).forEach(function (key) {
        context.options.sounds.push(sounds[key])
      })
      next()
    })

    socket.on('create_movie', function (data, cb) {
      console.log(context.options)
      if (context.options.sounds !== null) {
        let sounds = context.options.sounds
        let soundInputs = []
        let len = sounds.length
        sounds.forEach(function (sound) {
          console.log(sound)
          let url = sound.src
          if (url.indexOf('http://') !== -1 || url.indexOf('https://') !== -1) {
            let soundOutputPath = util.format('%s/download.mp3', outputDir)
            console.log('download from: ' + url)
            download(url, soundOutputPath, () => {
              let s = clone(sound)
              s.src = soundOutputPath
              soundInputs.push(s)
              if (soundInputs.length == len) {
                createMovie(cb, soundInputs)
              }
            })
          } else {
            let s = clone(sound)
            s.src = wwwDir + '/' + url
            soundInputs.push(s)
            if (soundInputs.length == len) {
              createMovie(cb, soundInputs)
            }
          }
        })
      } else {
        createMovie(cb, null)
      }
    })
  })

  function createMovie (cb, soundInputs) {
    let ext = mimeTypeToExtension(context.options.imageFormat)
    let inputField = util.format('%s/%%d.%s', outputDir, ext)
    let ffmpegCmd = serverConfig.ffmpegCmd
    let fps = context.options.frameRate
    let soundArgs = ''
    if (soundInputs !== null && soundInputs.length > 0) {
      soundInputs.forEach(function (input) {
        let length = context.options.movieLength
        // if ( input.hasOwnProperty('sound_length') ) {
        //   length = Math.floor(input.sound_length / fps)
        // }
        soundArgs += util.format(' -i %s -t %d ', input.src, length)
      })
      if (soundInputs.length > 1) {
        let songs = ''
        let trimArgs = ''
        let delayArgs = ''
        for (let i = 1; i <= soundInputs.length; i++) {
          let name = i.toString()
          if (soundInputs[i - 1].hasOwnProperty('sound_length')) {
            let length = Math.floor(soundInputs[i - 1].sound_length / fps)
            trimArgs += util.format('[%s]atrim=duration=%d[s%s];', name, length, name)
            name = 's' + name
          }
          let offset = Math.floor((soundInputs[i - 1].key / fps) * 1000)
          if (offset > 0) {
            delayArgs += util.format('[%s]adelay=%d|%d[s%s];', name, offset, offset, name)
            name = 's' + name
          }
          songs += util.format('[%s]', name)
        }
        soundArgs += util.format(' -filter_complex "%s%s%samix=inputs=%d:duration=first:dropout_transition=1" ', trimArgs, delayArgs, songs, soundInputs.length)
      }
    }
    let cmd = util.format('%s -y -r %d -i %s %s -r %d ', ffmpegCmd, fps, inputField, soundArgs, fps, context.getOutputPath())
    console.log('')
    console.log(cmd)
    childProcess.exec(cmd, {}, (err, stdout, stderr) => {
      if (stdout != null) {
        console.log(stdout)
      }
      if (stderr != null) {
        console.log(stderr)
      }
      cb(err, stdout, stderr)
    })
  }
}

