import clone from './clone.js'

const defaultInitFunction =  () => { console.log('%cinit() is undefined', 'color: red') }
const defaultUpdateFunction = () => { console.log('%cinit() is undefined', 'color: red') }

class AnimationContext {
  constructor (context) {
    this.canvas = context.canvas
    this.audio = context.audio
    this.audio1 = context.audio1
    this.audio2 = context.audio2
    this.audio3 = context.audio3
    this.audio4 = context.audio4
  }

  add(canvasElement) {
    this.canvas.add(canvasElement)
  }

  setBackground(img) {
    this.canvas.setBackgroundImage(img)
  }

  loadImage(url,options=null) {
    return new Promise(function(resolve,reject) {
      fabric.Image.fromURL(url, function(img) {
        resolve(img)
      }, options)
    })
  }

  createText(text, options = null) {
    return new fabric.Text(text, options);
  }
}

export default class Animation {

  constructor() {
    this.params = {}
    this.init = defaultInitFunction
    this.update = defaultUpdateFunction
    this.stop = () => {}
    this.context = null
  }

  doInit(context, config) {
    this.context = new AnimationContext(context)
    this.context.params = clone(this.params)
    return this.init.apply(this.context, [config])
  }

  doUpdate(key) {
    this.update.apply(this.context, [key])
  }

  doStop() {
    this.context.audio1.reset()
    this.context.audio2.reset()
    this.context.audio3.reset()
    this.context.audio4.reset()
    this.stop.apply(this.context)
  }

  loaded() {
    if ( this.init !== defaultInitFunction ) {
      return true
    }
    return false
  }
}
