export default class Context {

  constructor (app,socket,animation) {
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
  }

  init() {
    this.initFabric();
    this.initWebSocket();
  }

  initFabric() {
    var n = document.querySelector('#main-canvas');
    this.canvas = new fabric.StaticCanvas('main-canvas');

    // this.canvas.on('after:render', function() {});
  }

  initWebSocket() {
    this.socket.on('connect', function() {
      console.log('WebSocket:connected');
    });
    this.socket.onmessage = function(data) {
      console.log('WebSocket:onmessage');
      console.log(data);
    };
    this.socket.onerror = function(e) {
      console.log('WebSocket:onerror');
      console.log(e);
    };
  }

  clear() {
    this.canvas.clear();
    this.canvas.setBackgroundColor('#ffffff')
    this.canvas.setBackgroundImage(null)
    var store = this.app.$store
    this.animation.doInit(this, store.state.config);
    this.canvas.setWidth(store.state.config.width);
    this.canvas.setHeight(store.state.config.height);
    this.audioCommands = []
    this.app.$store.dispatch('SET_CURRENT_KEY', 0)
  }
}
