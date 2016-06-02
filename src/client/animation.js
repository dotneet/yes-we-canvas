import clone from './clone.js'

const defaultInitFunction =  () => { console.log('%cinit() is undefined', 'color: red') }
const defaultUpdateFunction = () => { console.log('%cinit() is undefined', 'color: red') }

class AnimationContext {
  constructor (context) {
    this.canvas = context.canvas
    this.audio = context.audio
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
    this.init.apply(this.context, [config])
  }

  doUpdate(key) {
    this.update.apply(this.context, [key])
  }

  doStop() {
    this.context.audio.reset()
    this.stop.apply(this.context)
  }

  loaded() {
    if ( this.init !== defaultInitFunction ) {
      return true
    }
    return false
  }
}
