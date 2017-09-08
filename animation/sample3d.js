/**
 * this.three: three utility
 * this.audio: audio utility
 */

// this parameter can be accessed by `this.params`
// when generate a video file with this script by record.js,
// this parameter can be override by parameter file supplied to record.js
animation.params = {
  images: [
    'https://i.imgur.com/3wDfRja.jpg',
    'https://i.imgur.com/3wDfRja.jpg',
    'https://i.imgur.com/3wDfRja.jpg',
    'https://i.imgur.com/3wDfRja.jpg',
    'https://i.imgur.com/3wDfRja.jpg',
    'https://i.imgur.com/3wDfRja.jpg'
  ]
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

  for (let i in this.params.images) {
    let img = this.params.images[i]
    let sprite = await this.three.createSpriteFromImage(img)
    sprite.position.set(-300 + (i*80), -100 + i*40, i*40)
    sprite.scale.set(80, 80, 1)
    scene.add(sprite)
  }

  this.line = line
  this.sprite = sprite

  // if this.render is defined, it is called every time after update()
  this.render = context.render
}

// update() is called every keyframe
animation.update = function (key) {
  if (key === 1) {
    this.audio.play('bgm01.mp3')
  }
  this.line.rotation.z += 0.1
}
