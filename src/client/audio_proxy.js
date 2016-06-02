export default class AudioProxy {
  constructor(app, elmId) {
    this.app = app
    this.elmId = elmId
    this.element = $('#' + elmId)[0]
    this.commands = []
  }
  setSource(source) {
    $('#' + this.elmId).attr('src', source + "?" + Math.floor(Math.random() * 1000000))
    this.commands.push({name:"source", src: source, key: this.app.currentKey})
  }
  init() {
    this.commands = []
  }
  play() {
    if ( this.element.paused ) {
      if ( !this.app.isBatch ) {
        this.element.play()
      }
      this.commands.push({name:"play", key: this.app.currentKey})
    }
  }
  pause() {
    if ( !this.app.isBatch ) {
      this.element.pause()
    }
    this.commands.push({name:"pause", key: this.app.currentKey})
  }
  reset() {
    if ( !this.app.isBatch ) {
      this.element.pause()
      this.element.currentTime = 0
    }
  }
}
