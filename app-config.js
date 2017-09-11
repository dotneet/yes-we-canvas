const path = require('path')

module.exports = {
  serverPort: 8100,
  commandPort: 8101,
  appRootDir: __dirname,
  ffmpegCmd: 'ffmpeg',
  outputDir: path.join(__dirname, 'output'),
  wwwDir: path.join(__dirname, 'www')
}
