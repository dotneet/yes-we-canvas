'use strict';
/**
 * This script make a movie file.
 * It is executed by phantomjs.
 */

var system = require('system');
var page = require('webpage').create();
var fs = require('fs');

var args = system.args;

var additionalParams = null;
if ( args.length > 1 ) {
  var file = args[1];
  var stream = fs.open(file, 'r');
  additionalParams = JSON.parse(stream.read())
}

page.onConsoleMessage = function(msg, lineNum, sourceId) {
  console.log('Client Message:' + msg);
};

page.onError = function (msg,trace) {
  console.log(msg);
  console.log(trace);
};

page.onCallback = function (data) {
  if ( data.cmd === "prepare" ) {
    if ( additionalParams !== null ) {
      var s = "function(){ window.store.state.batchParams = JSON.parse('" + JSON.stringify(additionalParams) + "'); }";
      page.evaluateJavaScript(s)
    }
    return additionalParams
  } else if ( data.cmd === "initialized" ) {
    page.evaluate(function() {
      $('#btn-record').click();
    })
  } else if ( data.cmd === "script_onload" ) {
    // do nothing.
  } else if ( data.cmd === "exit" ) {
    console.log("exit");
    phantom.exit();
    return "";
  } else {
    console.log("unknown command");
    console.log(data);
  }
};

page.open('http://localhost:8000/index.html', function(status) {
  console.log("complete page loading.");
});

