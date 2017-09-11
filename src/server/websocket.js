const fs = require('fs')
const http = require('http')
const childProcess = require('child_process')
const util = require('util')
const glob = require('glob')
const temp = require('temp')
const {URL} = require('url')
const AWS = require('aws-sdk')

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
  return new Promise((resolve, reject) => {
    try {
      let file = fs.createWriteStream(path)
      http.get(url, function (response) {
        response.pipe(file)
        response.on('end', function () {
          if (callback) {
            callback(file)
          }
          resolve(file)
        })
      })
    } catch (e) {
      reject(e)
    }
  })
}

function createTempFile (prefix) {
  return new Promise((resolve, reject) => {
    temp.open(prefix, function (err, info) {
      if (err) {
        return reject(err)
      }
      resolve(info)
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

      fs.access(outputDir, (err) => {
        if (!err) {
          let ext = mimeTypeToExtension(context.options.imageFormat)
          glob(outputDir + '/*.' + ext, null, (er, files) => {
            files.forEach((f) => {
              fs.unlink(f, (err) => {
                if (err) {
                  console.error(err)
                }
              })
            })
            cb()
          })
        } else {
          fs.mkdir(outputDir, (_) => {
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
        console.log('found a incorrect data type: ' + (typeof data))
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

    socket.on('create_movie', async function (data, cb) {
      console.log('[server] start create_movie task') 
      console.log(context.options)
      try {
        if (context.options.sounds === null || context.options.sounds.length === 0) {
          return createMovie(cb, null)
        }
        let sounds = context.options.sounds
        let soundInputs = []
        let len = sounds.length
        for (let i in sounds) {
          let sound = sounds[i]
          console.log('sound:', sound)
          let url = sound.src
          if (url.indexOf('http://') !== -1 || url.indexOf('https://') !== -1) {
            let soundOutputPath = util.format('%s/download.mp3', outputDir)
            console.log('download from: ' + url)
            await download(url, soundOutputPath)
            let s = clone(sound)
            s.src = soundOutputPath
            soundInputs.push(s)
          } else {
            let s = clone(sound)
            s.src = wwwDir + '/' + url
            soundInputs.push(s)
          }
        }
        createMovie(cb, soundInputs)
      } catch (e) {
        console.error(e)
        cb(e, '', '')
      }
    })
  })

  async function createMovie (cb, soundInputs) {
    console.log('[server] createMovie()')
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
    let outputPath = context.getOutputPath()
    let useS3 = outputPath.indexOf('s3:') === 0
    let tmpFile = null
    if (useS3) {
      tmpFile = await createTempFile({prefix: 'genvideo', suffix: '.mp4'})
      outputPath = tmpFile.path
    }
    let cmd = util.format('%s -y -r %d -i %s %s -r %d ', ffmpegCmd, fps, inputField, soundArgs, fps, outputPath)
    console.log('')
    console.log(cmd)
    childProcess.exec(cmd, {}, (err, stdout, stderr) => {
      if (stdout !== null) {
        console.log(stdout)
      }
      if (stderr !== null) {
        console.log(stderr)
      }
      if (useS3) {
        let s3Path = context.getOutputPath()
        let url = new URL(s3Path)
        let s3 = new AWS.S3()
        let params = {
          Bucket: url.host,
          Key: url.pathname.substr(1),
          Body: fs.readFileSync(outputPath)
        }
        console.log('Uploading to S3...')
        s3.putObject(params, function (err, data) {
          console.log('Uploading process is done')
          cb(err, stdout, stderr)
        })
      } else {
        cb(err, stdout, stderr)
      }
    })
  }
}
