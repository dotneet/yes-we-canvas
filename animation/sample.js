/**
 * this.canvas: fabric.StaticCanvas
 * this.audio: Audio
 */
var rect = null;
animation.params = {
  width: 100,
  height: 100
}

animation.init = function(config) {
  config.width = 320
  config.height = 240
  config.frameRate = 24
  config.movieLength = 5

  rect = new fabric.Rect({
    left: 100,
    top: 100,
    fill: 'red',
    width: this.params.width,
    height: this.params.height
  });
  this.canvas.add(rect);

  var canvas = this.canvas
  fabric.Image.fromURL('img/bg_sample01.jpg', function(img) {
    canvas.setBackgroundImage(img);
    canvas.renderAll();
  });
}

animation.update = function(key) {
  if ( key == 1 ) {
    this.audio.play('bgm01.mp3')
  }

  rect.left = 100 + key;
  rect.angle = key;
}

