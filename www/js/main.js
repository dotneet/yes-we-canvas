function init(canvas, config) {
  config.width = 320
  config.height = 240
  config.frameRate = 24
  config.movieLength = 3 

  // 矩形オブジェクトを作る
  var rect = new fabric.Rect({
    left: 100,
    top: 100,
    fill: 'red',
    width: 60,
    height: 50
  });
  var center = rect.getCenterPoint();
  rect.set({
    originX: 'center',
    originY: 'center',
    left: center.x,
    top: center.y
  });
  canvas.add(rect);

  fabric.Image.fromURL('img/bg_sample01.jpg', function(img) {
    canvas.setBackgroundImage(img);
    canvas.renderAll();
  });
}

function update(canvas, key) {
  var r = canvas.item(0);
  r.top = 100 + 100*Math.sin((key*4) * Math.PI / 180)
  r.angle = key*12;
}

