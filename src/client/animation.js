import clone from './clone.js'
import * as THREE from 'three'
import * as threeUtil from './three_util'

const defaultInitFunction = () => { console.log('%cinit() is undefined', 'color: red') }
const defaultUpdateFunction = () => { console.log('%cinit() is undefined', 'color: red') }

class AnimationContext {
  constructor (context) {
    this.canvas = context.canvas
    this.audio = context.audio
    this.audio1 = context.audio1
    this.audio2 = context.audio2
    this.audio3 = context.audio3
    this.audio4 = context.audio4
    this.fabricUtil = this.getFabricUtil()
    this.threeUtil = threeUtil
  }

  add (canvasElement) {
    this.canvas.add(canvasElement)
  }

  setBackground (img) {
    this.canvas.setBackgroundImage(img)
  }

  initThree () {
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

  getFabricUtil () {
    return {
      loadImage: function (url, options = null) {
        return new Promise(function (resolve, reject) {
          window.fabric.Image.fromURL(url, function (img) {
            resolve(img)
          }, options)
        })
      },
      createText: function (text, options = null) {
        return new window.fabric.Text(text, options)
      }
    }
  }
}

export default class Animation {

  constructor () {
    this.params = {}
    this.init = defaultInitFunction
    this.update = defaultUpdateFunction
    this.stop = () => {}
    this.context = null
  }

  doInit (context, config) {
    this.context = new AnimationContext(context)
    this.context.params = clone(this.params)
    return this.init.apply(this.context, [config])
  }

  doUpdate (key) {
    this.update.apply(this.context, [key])
  }

  doStop () {
    this.context.audio1.reset()
    this.context.audio2.reset()
    this.context.audio3.reset()
    this.context.audio4.reset()
    this.stop.apply(this.context)
  }

  loaded () {
    return this.init !== defaultInitFunction
  }
}
