import * as THREE from 'three'

class ThreeUtil {

  init () {
    let scene = new THREE.Scene()

    let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 500)
    camera.position.set(0, 0, 100)
    camera.lookAt(new THREE.Vector3(0, 0, 0))

    let renderer = new THREE.WebGLRenderer()
    renderer.domElement.id = 'main-canvas'
    renderer.setSize(640, 480)
    let render = () => {
      renderer.render(scene, camera)
    }
    document.getElementById('main-canvas-container').innerHTML = ''
    document.getElementById('main-canvas-container').appendChild(renderer.domElement)

    render()

    return {
      scene,
      camera,
      render,
      renderer
    }
  }

  loadImage (image) {
    return new Promise((resolve, reject) => {
      new THREE.TextureLoader().load(image, (texture) => {
        texture.minFilter = THREE.LinearFilter
        resolve(texture)
      }, null, (e) => {
        reject(e)
      })
    })
  }

  async createSpriteFromImage (imageUrl) {
    const map = await this.loadImage(imageUrl)
    const material = new THREE.SpriteMaterial({map: map, color: 0xffffff, fog: true})
    return new THREE.Sprite(material)
  }
}

export default new ThreeUtil()
