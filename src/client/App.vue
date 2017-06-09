<template>
  <div class="container">
    <div>
      <select @change="changeScript" v-model="selectedScript">
        <option v-for="script in scripts" :value="script">{{ script }}</option>
      </select>
    </div>
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
    <audio id="audio1" style="display: none;">Audio tag is not supported in this browser.</audio>
    <audio id="audio2" style="display: none;">Audio tag is not supported in this browser.</audio>
    <audio id="audio3" style="display: none;">Audio tag is not supported in this browser.</audio>
    <audio id="audio4" style="display: none;">Audio tag is not supported in this browser.</audio>
  </div>
</template>

<script>

import Context from './context.js'
import AudioProxy from './audio_proxy.js'
import _ from 'lodash'
import {mapGetters} from 'vuex'

let timer = null
let $ = window.$

function waitMainScriptLoading (cb) {
  let f = () => {
    if (window.animation.loaded()) {
      cb()
    } else {
      setTimeout(f, 200)
    }
  }
  setTimeout(f, 200)
}

export default {
  name: 'App',
  data () {
    var data = {
      videoSource: 'output.mp4',
      context: new Context(this, window.io(), window.animation),
      animation: window.animation,
      scripts: [],
      selectedScript: null
    }
    return data
  },
  mounted () {
    this.bootstrap()
    this.$bus.$on('bootstrap', () => {
      this.bootstrap()
    })
  },
  computed: {
    ...mapGetters(['config', 'currentKey', 'canvasWidth', 'canvasHeight']),
    isBatch () {
      return this.$store.state.batch
    },
    totalFrame () {
      return this.config.movieLength * this.config.frameRate
    }
  },
  methods: {
    bootstrap () {
      $.ajax({
        url: '/animation/',
        dataType: 'json',
        complete: (response) => {
          console.log(response)
          this.scripts = response.responseJSON.files
          var batchParams = this.$store.state.batchParams
          if (batchParams !== null && batchParams.script !== null) {
            this.selectedScript = batchParams.script
          } else {
            this.selectedScript = this.scripts[0]
          }
          this.loadScript(() => {
            waitMainScriptLoading(() => {
              this.context.init()
              this.context.audio = new AudioProxy(this, 'audio1')
              this.context.audio1 = this.context.audio
              this.context.audio2 = new AudioProxy(this, 'audio2')
              this.context.audio3 = new AudioProxy(this, 'audio3')
              this.context.audio4 = new AudioProxy(this, 'audio4')
              var me = this
              this.context.clear().then(function () {
                console.log('application initialized after Promise')
                me.$bus.$emit('application_initialized')
              })
            })
          })
        }
      })
    },
    changeScript () {
      console.log(this.selectedScript)
      if (this.selectedScript != null) {
        this.loadScript(() => {
          this.context.clear()
        })
      }
    },
    loadScript (callback) {
      var script = document.createElement('script')
      script.src = 'animation/' + this.selectedScript + '?' + Math.floor(Math.random() * 1000000)
      script.onload = () => {
        this.$bus.$emit('script_onload')
        var batchParams = this.$store.state.batchParams
        if (batchParams !== null && batchParams.params !== null) {
          window.animation.params = _.merge(window.animation.params, this.$store.state.batchParams.params)
        }
        callback()
      }

      document.head.appendChild(script)
    },
    update () {
      this.animation.doUpdate(this.currentKey)
      this.context.canvas.renderAll()
    },
    record () {
      if (this.isBatch || confirm('Do you want to export as video?')) {
        this.loadScript(() => {
          let me = this
          this.context.clear().then(function () {
            let batchParams = me.$store.state.batchParams
            let options = me.config
            me.context.socket.emit('start_record', {options: options, batchParams: batchParams}, () => {
              me.saveAllFrames()
            })
          })
        })
      }
    },
    saveAllFrames () {
      const totalFrame = this.totalFrame
      var record = null
      var c = document.getElementById('main-canvas')
      record = () => {
        this.update()
        this.$store.commit('NEXT_KEY')
        c.toBlob((blob) => {
          this.context.socket.emit('record', blob, () => {
            if (this.currentKey < totalFrame) {
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
    sendSoundCommand (cb) {
      if (this.context.audioCommands.length > 0) {
        this.context.socket.emit('set_sound', {commands: this.context.audioCommands}, () => {
          cb()
        })
      } else {
        cb()
      }
    },
    createMovie () {
      this.context.socket.emit('create_movie', {}, (err, stdout, stderr) => {
        if (this.isBatch) {
          this.$bus.$emit('finish_record')
        } else {
          if (err !== null) {
            alert(stderr)
          } else {
            this.showVideo()
          }
        }
      })
    },
    showVideo () {
      this.videoSource = 'output.' + this.config.videoFormat + '?' + Math.floor(100000 * Math.random())
      let elm = $('#video')[0]
      elm.load()
      $('button.fancybox').click()
    },
    play () {
      this.loadScript(() => {
        this.context.clear()
        if (timer !== null) {
          clearInterval(timer)
        }

        const totalFrame = this.totalFrame
        timer = setInterval(() => {
          this.update()
          this.$store.commit('NEXT_KEY')
          if (this.currentKey >= totalFrame) {
            this.stop()
          }
        }, 1000 / this.config.frameRate)
      })
    },
    stop () {
      this.animation.doStop()
      clearInterval(timer)
      timer = null
    },
    prev () {
      this.$store.commit('PREV_KEY')
      this.update()
    },
    next () {
      this.update()
      this.$store.commit('NEXT_KEY')
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

