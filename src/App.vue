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
        <button class="iframe fancybox" href="#video">Show Video</button>
      </div>
    </div>
    <video id="video" :src="videoSource" :width="canvasWidth" :height="canvasHeight" controls style="display: none;">Error</video>
  </div>
</template>

<script>

var timer = null
var canvas = null;
function initApp() {
  initFabric();
  initWebSocket();
}

function initFabric() {
  var n = document.querySelector('#main-canvas');
  canvas = new fabric.StaticCanvas('main-canvas');
  canvas.setBackgroundColor('#ffffff');

  // canvas.on('after:render', function() {});
}

function clearContext(store) {
  canvas.clear();
  window.init(canvas, store.state.config);
  canvas.setWidth(store.state.config.width);
  canvas.setHeight(store.state.config.height);
  store.dispatch('SET_CURRENT_KEY', 0)
}

function reloadMainScript(cb) {
  var script = document.createElement('script')
  script.src = 'js/main.js?' + Math.floor(Math.random() * 1000000)
  script.onload = cb
  
  document.head.appendChild(script)
}

var socket = io();
function initWebSocket() {
  socket.on('connect', function() {
    console.log('WebSocket:connected');
  });
  socket.onmessage = function(data) {
    console.log('WebSocket:onmessage');
    console.log(data);
  };
  socket.onerror = function(e) {
    console.log('WebSocket:onerror');
    console.log(e);
  };
}

export default {
  name: 'App',
  data () {
    return {
        videoSource: 'output.mp4'
      };
  },
  ready () {
    initApp();
    clearContext(this.$store);
    console.log('application initialized');
  },
  computed: {
    totalFrame () {
      return this.config.movieLength * this.config.frameRate
    }
  },
  methods: {
    update() {
      update(canvas, this.currentKey)
      canvas.renderAll();
    },
    record() {
      if ( confirm('Do you want to export as video?') ) {
        reloadMainScript(()=>{ 
          clearContext(this.$store);
          socket.emit('start_record', {
              format: this.config.imageFormat,
              frameRate: this.config.frameRate
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
          socket.emit('record', blob, () => {
            if ( this.currentKey < totalFrame ) {
              record()
            } else {
              socket.emit('create_movie', {}, (err,stdout,stderr) => {
                if ( this.$store.state.batch ) {
                  this.$dispatch('finish_record')
                } else {
                  if ( err !== null ) {
                    alert(stderr)
                  } else {
                    $('#video').attr('src', 'output.mp4?' + Math.floor(100000*Math.random()));
                    $('button.fancybox').click()
                  }
                }
              })
            }
          })
        }, this.config.imageFormat)
      }
      record()
    },
    play() {
      reloadMainScript(()=>{ 
        clearContext(this.$store)
        if ( timer != null ) {
          clearInterval(timer)
        }

        const totalFrame = this.totalFrame
        timer = setInterval(() => {
          this.$store.dispatch('NEXT_KEY')
          this.update()
          if ( this.currentKey >= totalFrame ) {
            clearInterval(timer)
            timer = null;
          }
        }, 1000 / this.config.frameRate)
      })
    },
    stop () {
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

