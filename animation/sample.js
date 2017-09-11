/**
 * this.three: three utility
 * this.audio: audio utility
 */

// this parameter can be accessed by `this.params`
// when generate a video file with this script by record.js,
// this parameter can be override by parameter file supplied to record.js
animation.params = {
  image: 'img/hoge.jpg'
}

// init() is called once before starting animation
animation.init = async function (config) {
  // movieLength express the length of movie in seconds.
  config.movieLength = 10
  // frameRate express the frame-count by second.
  config.frameRate = 30

  const context = this.three.init()
  let scene = context.scene

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

  let sprite = await this.three.createSpriteFromImage(this.params.image)
  sprite.position.set(0, 0, 0)
  sprite.scale.set(640, 480, 1)
  scene.add(sprite)

  this.line = line
  this.sprite = sprite

  // if this.render is defined, it is called every time after update()
  this.render = context.render
}

// update() is called every keyframe
animation.update = function (key) {
  if (key === 1) {
    this.audio.play('sound/bgm01.mp3')
  }
  this.line.rotation.z += 0.1
}
