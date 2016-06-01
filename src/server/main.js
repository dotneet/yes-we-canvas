'use strict';

var serverConfig = require('../../config.js')
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var websocket = require('./websocket.js')

websocket(io, serverConfig)

app.use(express.static(serverConfig.wwwDir));

http.listen(8000, function() {
  console.log('listen');
});
