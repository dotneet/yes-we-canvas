const path = require('path')

module.exports = {
  appRootDir: __dirname,
  ffmpegCmd: 'ffmpeg',
  outputDir: path.join(__dirname, 'output'),
  wwwDir: path.join(__dirname, 'www')
}
