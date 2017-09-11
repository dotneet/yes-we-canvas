/**
 * this.three: three utility
 * this.audio: audio utility
 */

// this parameter can be accessed by `this.params`
// when generate a video file with this script by record.js,
// this parameter can be override by parameter file supplied to record.js
animation.params = {
  images: [
    'img/hoge.jpg',
    'img/hoge.jpg',
    'img/hoge.jpg',
    'img/hoge.jpg',
    'img/hoge.jpg',
    'img/hoge.jpg'
  ]
}

// init() is called once before starting animation
animation.init = async function (config) {
  // movieLength express the length of movie in seconds.
  config.movieLength = 13
  // frameRate express the frame-count by second.
  config.frameRate = 60

  const context = this.three.init3D()
  let scene = context.scene

  this.origin = 0
  const u = (Math.PI / 180.0)
  this.images = []
  for (let i in this.params.images) {
    let img = this.params.images[i]
    let sprite = await this.three.createMeshFromImage(img, 4, 3)
    sprite.scale.set(4 * 20, 3 * 20, 1)

    const ox = i * 60
    const oy = i * 60 - 90
    const oz = i * 60
    let x = Math.sin(u * ox) * 200.0
    let y = Math.cos(u * oy) * 50.0
    let z = Math.cos(u * oz) * 480.0
    console.log(x, y, z)
    sprite.position.set(x, y, z)

    scene.add(sprite)
    this.images.push(sprite)
  }

  // if this.render is defined, it is called every time after update()
  this.render = context.render
}

// update() is called every keyframe
animation.update = function (key) {
  const u = (Math.PI / 180.0)
  for (let i in this.images) {
    let img = this.images[i]
    const ox = i * 60
    const oy = i * 60 - 90
    const oz = i * 60
    let x = Math.sin(u * (ox + key * 0.5)) * 200.0
    let y = Math.cos(u * (oy + key * 0.5)) * 50.0
    let z = Math.cos(u * (oz + key * 0.5)) * 480.0
    img.position.set(x, y, z)
  }
}
