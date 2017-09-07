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

  /*
  let material = new THREE.LineBasicMaterial({color: 0x0000ff})

  let geometry = new THREE.Geometry()
  geometry.vertices.push(new THREE.Vector3(0, 0, -1))
  geometry.vertices.push(new THREE.Vector3(-100, -100, -1))
  geometry.vertices.push(new THREE.Vector3(0, -100, -1))

  let line = new THREE.Line(geometry, material)
  */
  let line = this.three.createLine({color: 0x0000ff}, [
    [-50, -50, 1],
    [-50, 50, 1],
    [50, 50, 1],
    [50, -50, -1],
    [-50, -50, -1]
  ])
  line.rotation.z = 0.1
  line.position.set(0, 0, -20)
  scene.add(line)

  let sprite = await this.three.createSpriteFromImage('img/hoge.jpg')
  sprite.position.set(0, 0, 0)
  sprite.scale.set(640, 480, 1)
  scene.add(sprite)

  this.line = line
  this.sprite = sprite
  this.render = three.render
  this.render()
}

animation.update = function (key) {
  if (key === 1) {
    this.audio.play('bgm01.mp3')
  }
  console.log('RENDER')
  this.line.rotation.z += 0.1
  this.sprite.position.x += 0.1
  this.render()
}

