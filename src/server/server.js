const serverConfig = require('../../app-config.js')
const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const websocket = require('./websocket.js')
const glob = require('glob')
const record = require('../lib/record')
const request = require('request')

async function startServer (port = 8000) {

  const app = express()
  const http = require('http').Server(app)
  const io = require('socket.io')(http)

  websocket(io, serverConfig)

  app.use(express.static(serverConfig.wwwDir))
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({extended: true}))

  app.post('/animation/:name/record', async function (req, res) {
    await record(req.body, startServer)
    res.json({message: 'OK'})
  })

  // this endpoint can be used to get around CORS restrict
  app.get('/proxy', async function (req, res) {
    let url = req.query.url
    request({url: url, method: 'GET', encoding: null}, (err, response, body) => {
      if (err) {
        res.sendStatus(400)
        return res.send({message: 'error'})
      }
      res.set('Content-Type', response.headers['content-type'])
      res.send(body)
    })
  })

  app.get('/animation/:name', function (req, res) {
    const options = {
      root: serverConfig.appRootDir + '/animation',
      dotfiles: 'deny',
      headers: {
        'content-type': 'text/javascript'
      }
    }
    res.sendFile(req.params.name, options, function (err) {
      if (err) {
        console.log(err)
        res.status(err.status).end()
      }
    })
  })

  app.get('/animation/', function (req, res) {
    glob(serverConfig.appRootDir + '/animation/*.js', null, function (_, files) {
      console.log(files)
      files = files.map((f) => { return path.basename(f) })
      res.json({files: files})
    })
  })

  return new Promise((resolve, reject) => {
    http.listen(port, function () {
      console.log(`listen: ${port}`)
      resolve(http)
    })
  })
}

module.exports = startServer
