'use strict';

var serverConfig = require('../../app-config.js')
var express = require('express');
var path = require('path');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var websocket = require('./websocket.js')
var glob = require("glob")

websocket(io, serverConfig)

app.use(express.static(serverConfig.wwwDir));

app.get('/animation/:name', function(req, res) {
  var options = {
    root: serverConfig.appRootDir + '/animation',
    dotfiles: 'deny',
    headers: {
      'content-type': 'text/javascript'
    }
  }
  res.sendFile(req.params.name, options, function(err) {
    if (err) {
      console.log(err)
      res.status(err.status).end()
    }
  })
})

app.get('/animation/', function(req, res) {
  glob(serverConfig.appRootDir +'/animation/*.js', null, function(err, files) {
    console.log(files)
    files = files.map((f) => { return path.basename(f);})
    res.json({files:files})
  })
})

http.listen(8000, function() {
  console.log('listen');
});
