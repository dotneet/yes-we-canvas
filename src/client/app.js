import Vue from 'vue'
import App from './App.vue'
import store from './vuex/store.js'
import Animation from './animation.js'

Vue.config.debug = true

var isBatch = (typeof window.callPhantom === 'function')
store.state.batch = isBatch

var animation = new Animation()
store.animation = animation
window.animation = animation
window.store = store

/* eslint-disable no-new */
const vue = new Vue({
  el: 'body',
  components: [App],
  store
})

// for batch mode
if ( isBatch ) {
  window.callPhantom({ cmd: 'prepare' })

  vue.$on('script_onload', () => {
    console.log('script_onload')
    window.callPhantom({ cmd: 'script_onload' })
  })

  vue.$on('application_initialized', () => {
    console.log('event app init')
    window.callPhantom({ cmd: 'initialized' })
  })

  vue.$on('finish_record', () => {
    console.log('finish_record')
    window.callPhantom({ cmd: 'exit' })
  })

}

jQuery(function($){
  $('.fancybox').fancybox();
});

