import Vue from 'vue'
import App from './App.vue'
import store from './vuex/store.js'
import Animation from './animation.js'

Vue.config.debug = true

var animation = new Animation()
store.animation = animation
window.animation = animation

/* eslint-disable no-new */
const vue = new Vue({
  el: 'body',
  components: [App],
  store
})


if (typeof window.callPhantom === 'function') {
  store.state.batch = true

  setTimeout(function() {
    $('#btn-record').click();
  }, 500);

  vue.$on('finish_record', () => {
    console.log('finish_record')
    window.callPhantom({ cmd: 'exit' })
  })
}

jQuery(function($){
  $('.fancybox').fancybox();
});

