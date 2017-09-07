/**
 * this.threeUtil: utility
 * this.audio: Audio
 */
animation.params = {
  width: 100,
  height: 100
}

animation.init = async function (config) {
  config.width = 640
  config.height = 480
  console.log(this)
  const three = this.three.init()
  let scene = three.scene
  let camera = three.camera

  let material = new THREE.LineBasicMaterial({color: 0x0000ff})

  let geometry = new THREE.Geometry()
  geometry.vertices.push(new THREE.Vector3(-10, 0, 0))
  geometry.vertices.push(new THREE.Vector3(0, 10, 0))
  geometry.vertices.push(new THREE.Vector3(10, 0, 0))

  let line = new THREE.Line(geometry, material)
  scene.add(line)

  let sprite = await this.three.createSpriteFromImage('img/hoge.jpg')
  sprite.position.set(20, 0, 0)
  sprite.scale.set(200, 20, 10)
  scene.add(sprite)

  this.line = line
  this.render = three.render
  this.render()
}

animation.update = function (key) {
  if (key === 1) {
    this.audio.play('bgm01.mp3')
  }
  console.log('RENDER')
  this.line.rotation.x += 0.1
  this.render()
}

