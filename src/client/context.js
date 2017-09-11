export default class Context {

  constructor (app, socket, animation) {
    this.app = app
    this.socket = socket
    this.animation = animation
    this.canvas = null
    this.audio = null
    this.audio1 = null
    this.audio2 = null
    this.audio3 = null
    this.audio4 = null
    this.audioCommands = []
    this.initialized = false
  }

  init () {
    this.initFabric()
    this.initWebSocket()
    this.initialized = true
  }

  initFabric () {
    // this.canvas = new window.fabric.StaticCanvas('main-canvas')
  }

  initWebSocket () {
    this.socket.on('connect', function () {
      console.log('WebSocket:connected')
    })
    this.socket.onmessage = function (data) {
      console.log('WebSocket:onmessage')
      console.log(data)
    }
    this.socket.onerror = function (e) {
      console.log('WebSocket:onerror')
      console.log(e)
    }
  }

  clear () {
    // this.canvas.clear()
    // this.canvas.setBackgroundColor('#ffffff')
    // this.canvas.setBackgroundImage(null)
    this.audioCommands = []
    let store = this.app.$store
    let obj = this.animation.doInit(this, store.state.config)
    let me = this
    if (obj !== null && (typeof obj) === 'object' && 'then' in obj) {
      return obj.then(function () {
        // me.canvas.setWidth(store.state.config.width)
        // me.canvas.setHeight(store.state.config.height)
        me.app.$store.commit('SET_CURRENT_KEY', 0)
      })
    } else {
      return new Promise(function (resolve, reject) {
        // me.canvas.setWidth(store.state.config.width)
        // me.canvas.setHeight(store.state.config.height)
        me.app.$store.commit('SET_CURRENT_KEY', 0)
        resolve()
      })
    }
  }
}
