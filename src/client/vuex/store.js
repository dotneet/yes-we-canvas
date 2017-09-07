import Vue from 'vue'
import Vuex from 'vuex'

import mutations from './mutations'

Vue.use(Vuex)

const state = {
  config: {
    width: 400,
    height: 300,
    movieLength: 1,
    frameRate: 30,
    imageFormat: 'image/jpeg',
    videoFormat: 'mp4',
    outputPath: null
  },
  batch: false,
  batchParams: null,
  script: null,
  animation: null,
  currentKey: 0
}

const actions = {
  next_key (context) {
    context.commit('NEXT_KEY')
  },
  prev_key (context) {
    context.commit('PREV_KEY')
  }
}

export default new Vuex.Store({
  state: state,
  mutations: mutations,
  actions: actions,
  getters: {
    config: state => { return state.config },
    currentKey: state => { return state.currentKey },
    canvasWidth: state => { return state.config.width },
    canvasHeight: state => { return state.config.height }
  }
})
