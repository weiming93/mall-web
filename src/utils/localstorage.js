const storage = {
  save(key, value) {
    localStorage.setItem(key, value)
  },
  get(key, defaultValue = {}) {
    return localStorage.getItem(key) || defaultValue
  },
  remove(key) {
    localStorage.removeItem(key)
  },
  clear() {
    localStorage.clear()
  }
}

export default storage
