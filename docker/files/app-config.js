const path = require('path')

module.exports = {
  chromy: {
     launchBrowser: false,
     host: '127.0.0.1',
     port: 9222
  },
  serverPort: 8100,
  commandPort: 8101,
  appRootDir: __dirname,
  ffmpegCmd: '/usr/local/bin/ffmpeg',
  outputDir: path.join(__dirname, 'output'),
  wwwDir: path.join(__dirname, 'www'),
  s3: {
    options: {
      ACL: "public-read", 
      Metadata: {
        "Content-Type": "video/mp4"
      }
    }
  }
}
