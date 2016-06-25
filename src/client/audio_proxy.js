export default class AudioProxy {
  constructor(app, elmId) {
    this.app = app
    this.elmId = elmId
    this.element = $('#' + elmId)[0]
    this.source = null
  }
  setSource(source) {
    this.source = source
    $('#' + this.elmId).attr('src', source + "?" + Math.floor(Math.random() * 1000000))
    // this.app.context.audioCommands.push({name:"source", src: source, key: this.app.currentKey})
  }
  init() {
  }
  play(source) {
    if ( this.source !== source || this.element.paused ) {
      this.setSource(source)
      if ( !this.app.isBatch ) {
        this.element.play()
      }
      this.app.context.audioCommands.push({name:"play", src: this.source, key: this.app.currentKey})
    }
  }
  pause() {
    if ( !this.app.isBatch ) {
      this.element.pause()
    }
    this.app.context.audioCommands.push({name:"pause", src: this.source, key: this.app.currentKey})
  }
  reset() {
    console.log('reset:' + this.elmId)
    if ( !this.app.isBatch ) {
      this.element.pause()
      this.element.currentTime = 0
    }
  }
}
