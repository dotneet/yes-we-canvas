import * as THREE from 'three'

class ThreeUtil {

  // 2D 描画用のシーンを作成する
  // 平行投影カメラを使うのでZ座標の変化による表示サイズのスケールは行われない
  init (width = 640, height = 480) {
    let scene = new THREE.Scene()

    let camera = new THREE.OrthographicCamera(-width / 2, width / 2, -height / 2, width / 2, 0.001, 5000)
    camera.position.set(0, 0, -1000)
    camera.lookAt(new THREE.Vector3(0, 0, 0))

    let renderer = new THREE.WebGLRenderer()
    renderer.domElement.id = 'main-canvas'
    renderer.setSize(width, height)
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

  init3D () {
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

  createLine (mat, vectors) {
    let material = new THREE.LineBasicMaterial(mat)

    let geometry = new THREE.Geometry()
    vectors.forEach(v => {
      geometry.vertices.push(new THREE.Vector3(v[0], v[1], v[2]))
    })

    return new THREE.Line(geometry, material)
  }

  loadImage (image) {
    return new Promise((resolve, reject) => {
      new THREE.TextureLoader().load(image, (texture) => {
        texture.minFilter = THREE.LinearFilter
        texture.flipY = false
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
