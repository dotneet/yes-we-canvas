/**
 * this.threeUtil: utility
 * this.audio: Audio
 */
var rect = null;
animation.params = {
  width: 100,
  height: 100
}
var render = null

animation.init = async function (config) {
  config.width = 640
  config.height = 480
  const three = this.initThree()
  let scene = three.scene
  let camera = three.camera

  var material = new THREE.LineBasicMaterial({ color: 0x0000ff });

  var geometry = new THREE.Geometry();
  geometry.vertices.push(new THREE.Vector3(-10, 0, 0));
  geometry.vertices.push(new THREE.Vector3(0, 10, 0));
  geometry.vertices.push(new THREE.Vector3(10, 0, 0));

  var line = new THREE.Line(geometry, material);
  scene.add(line);

  var sprite = await this.threeUtil.createSpriteFromImage('img/hoge.jpg')
  sprite.position.set(20, 0, 0)
  sprite.scale.set(200, 20, 10)
  scene.add(sprite);

  let renderer = three.renderer
  renderer.domElement.id = 'main-canvas'
  renderer.setSize( config.width, config.height );
  render = three.render
  document.getElementById('main-canvas-container').innerHTML = '';
  document.getElementById('main-canvas-container').appendChild(renderer.domElement);

  render()
  this.line = line
  this.render = render
}

animation.update = function(key) {
  if ( key == 1 ) {
    this.audio.play('bgm01.mp3')
  }
  console.log('RENDER')
  this.line.rotation.x += 0.1
  this.render()
}

