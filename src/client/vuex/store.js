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
    videoFormat: 'mp4'
  },
  batch: false,
  script: null,
  animation: null,
  currentKey: 0
}

const actions = {
    next_key: 'NEXT_KEY',
    prev_key: 'PREV_KEY'
}

export default new Vuex.Store({
  state: state,
  mutations: mutations,
  actions: actions
})

