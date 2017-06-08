export default {
  SET_CURRENT_KEY (state) {
    state.currentKey = 0
  },
  NEXT_KEY (state) {
    state.currentKey = state.currentKey + 1
  },
  PREV_KEY (state) {
    state.currentKey = state.currentKey - 1
  }
}
