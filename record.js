var page = require('webpage').create();

page.onConsoleMessage = function(msg, lineNum, sourceId) {
  console.log('Client Message:' + msg);
};

page.onError = function (msg,trace) {
  console.log(msg);
  console.log(trace);
};

page.onCallback = function (data) {
  if ( data.cmd === "exit" ) {
    page.render('output/example.png');
    phantom.exit();
    return "";
  } else {
    console.log("unknown command");
    console.log(data);
  }
};

page.open('http://localhost:8000/index.html', function(status) {
  console.log("complete page loading.");
  if(status === "success") {
    var c = page.evaluate(function(){
      $('#btn-record').click();
    });
  }
});
