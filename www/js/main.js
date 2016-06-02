/**
 * this.canvas: fabric.StaticCanvas
 * this.audio: Audio
 */
var rect = null;
animation.init = function(config) {
  //this.audio.setSource('sample.mp3')
  config.width = 320
  config.height = 240
  config.frameRate = 24
  config.movieLength = 5

  // 矩形オブジェクトを作る
  rect = new fabric.Rect({
    left: 100,
    top: 100,
    fill: 'red',
    width: 60,
    height: 50
  });
  this.canvas.add(rect);

  var canvas = this.canvas
  fabric.Image.fromURL('img/bg_sample01.jpg', function(img) {
    canvas.setBackgroundImage(img);
    canvas.renderAll();
  });
}

animation.update = function(key) {
  //if ( key == 1 ) {
  //  this.audio.play()
  //}

  rect.left = 100 + key;
  rect.angle = key;
}

