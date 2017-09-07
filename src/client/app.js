import Vue from 'vue'
import App from './App.vue'
import store from './vuex/store.js'
import Animation from './animation.js'
import VueEventBus from 'vue-event-bus'
import * as THREE from 'three'

Vue.config.debug = true

Vue.use(VueEventBus)

var animation = new Animation()
store.animation = animation
window.animation = animation
window.store = store
window.THREE = THREE

/* eslint-disable no-new */
const vue = new Vue({
  el: '#app',
  render: function (h) {
    return h('App')
  },
  components: {App},
  store
})

window.onBatch = async () => {
  store.state.batch = true
  window.sendToChromy({cmd: 'prepare'})

  vue.$bus.$on('script_onload', () => {
    console.log('script_onload')
    window.sendToChromy({cmd: 'script_onload'})
  })

  vue.$bus.$on('application_initialized', () => {
    console.log('event app init')
    window.sendToChromy({cmd: 'initialized'})
  })

  vue.$bus.$on('finish_record', () => {
    console.log('finish_record')
    window.sendToChromy({cmd: 'exit'})
  })

  vue.$bus.$emit('bootstrap')
}

window.jQuery(function ($) {
  $('.fancybox').fancybox()
})

