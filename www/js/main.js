var rect = null;
function init(canvas, config) {
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
  canvas.add(rect);

  fabric.Image.fromURL('img/bg_sample01.jpg', function(img) {
    canvas.setBackgroundImage(img);
    canvas.renderAll();
  });
}

function update(canvas, key) {
  rect.left = 100 + key;
  rect.angle = key;
}

