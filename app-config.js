const path = require('path')

module.exports = {
  // chromy: {
  //   launchBrowser: false,
  //   host: '127.0.0.1',
  //   port: 9222
  // },
  serverPort: 8100,
  commandPort: 8101,
  appRootDir: __dirname,
  ffmpegCmd: '/home/travelme/yes-we-canvas/docker/ffmpeg',
  outputDir: path.join(__dirname, 'output'),
  wwwDir: path.join(__dirname, 'www')
}
