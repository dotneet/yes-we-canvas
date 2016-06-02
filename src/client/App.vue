<template>
  <div class="container">
    <canvas id="main-canvas" :width="canvasWidth" :height="canvasHeight"></canvas>
    <div id="main-control-panel">
      <div>
        <button id="btn-prev" @click="prev"><i class="material-icons">keyboard_arrow_left</i></button>
        <div style="display:inline-block; min-width: 4.5rem;">{{ currentKey }}/{{ totalFrame }}</div>
        <button id="btn-next" @click="next"><i class="material-icons">keyboard_arrow_right</i></button>
      </div>
      <div style="margin-top: 0.5rem">
        <button id="btn-play" @click="play"><i class="material-icons">play_arrow</i>Play</button>
        <button id="btn-stop" @click="stop"><i class="material-icons">stop</i>Stop</button>
      </div>
      <div style="margin-top: 0.5rem">
        <button id="btn-record" @click="record"><i class="material-icons">videocam</i>Output Video</button>
        <button class="iframe fancybox" href="#video" @click="showVideo">Show Video</button>
      </div>
    </div>
    <video id="video" :src="videoSource" :width="canvasWidth" :height="canvasHeight" controls style="display: none;">Video tag is not supported in this browser.</video>
    <audio id="audio" :src="audioSource" style="display: none;">Audio tag is not supported in this browser.</audio>
  </div>
</template>

<script>

import Context from './context.js';
import AudioProxy from './audio_proxy.js';

var timer = null

function waitMainScriptLoading(cb) {
  var f;
  f = () => {
     if ( animation.loaded() ) {
       cb()
     } else {
       setTimeout(f, 200)
     }
  }
  setTimeout(f, 200)
}
function reloadMainScript(cb) {
  var script = document.createElement('script')
  script.src = 'js/main.js?' + Math.floor(Math.random() * 1000000)
  script.onload = cb
  
  document.head.appendChild(script)
}

export default {
  name: 'App',
  data () {
    var data = {
        videoSource: 'output.mp4',
        context: new Context(this, io(), window.animation),
        animation: window.animation,
        isBatch: this.$store.state.batch
      };
    return data;
  },
  ready () {
    waitMainScriptLoading(()=>{
      this.context.init()
      this.context.audio = new AudioProxy(this, 'audio')
      this.context.clear()
      console.log('application initialized');
      this.$dispatch('application_initialized')
    })
  },
  computed: {
    totalFrame () {
      return this.config.movieLength * this.config.frameRate
    }
  },
  methods: {
    update() {
      this.animation.doUpdate(this.currentKey)
      this.context.canvas.renderAll();
    },
    record() {
      if ( this.isBatch || confirm('Do you want to export as video?') ) {
        reloadMainScript(()=>{ 
          this.context.clear()
          this.context.socket.emit('start_record', {
              format: this.config.imageFormat,
              frameRate: this.config.frameRate,
              movieLength: this.config.movieLength
            }, ()=> {
              this.saveAllFrames()
            })
        })
      }
    },
    saveAllFrames() {
      const totalFrame = this.totalFrame
      var record = null;
      var c = document.getElementById('main-canvas')
      record = () => {
        this.$store.dispatch('NEXT_KEY')
        this.update()
        c.toBlob((blob) => {
          this.context.socket.emit('record', blob, () => {
            if ( this.currentKey < totalFrame ) {
              record()
            } else {
              this.stop()
              this.sendSoundCommand(() => {
                this.createMovie()
              })
            }
          })
        }, this.config.imageFormat)
      }
      record()
    },
    sendSoundCommand(cb) {
      if ( this.context.audio.commands.length > 0 ) {
        this.context.socket.emit('set_sound', {commands: this.context.audio.commands}, () => {
          cb()
        })
      } else {
        cb()
      }
    },
    createMovie() {
      this.context.socket.emit('create_movie', {}, (err,stdout,stderr) => {
        if ( this.isBatch ) {
          this.$dispatch('finish_record')
        } else {
          if ( err !== null ) {
            alert(stderr)
          } else {
            this.showVideo()
          }
        }
      })
    },
    showVideo() {
      this.videoSource = 'output.mp4?' + Math.floor(100000*Math.random())
      var elm = $('#video')[0]
      elm.load()
      $('button.fancybox').click()
    },
    play() {
      reloadMainScript(()=>{ 
        this.context.clear()
        if ( timer != null ) {
          clearInterval(timer)
        }

        const totalFrame = this.totalFrame
        timer = setInterval(() => {
          this.$store.dispatch('NEXT_KEY')
          this.update()
          if ( this.currentKey >= totalFrame ) {
            this.stop()
          }
        }, 1000 / this.config.frameRate)
      })
    },
    stop () {
      this.animation.stop()
      clearInterval(timer)
      timer = null
    },
    prev() {
      this.$store.dispatch('PREV_KEY')
      this.update()
    },
    next() {
      this.$store.dispatch('NEXT_KEY')
      this.update()
    }
  },
  vuex: {
    getters: {
      config(state) {
        return state.config
      },
      currentKey(state) {
        return state.currentKey
      },
      canvasWidth(state) {
        return state.config.width
      },
      canvasHeight(state) {
        return state.config.height
      }
    }
  }
}

</script>

<style scoped>

.loading-screen {
  z-index: 100;
  background-color: rgba(0,0,0,0.0);
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  line-height: 100%;
  text-align: center;
  vertical-align: middle;
}

.loading-screen .preloader-wrapper {
  top: 40%;
}

</style>

