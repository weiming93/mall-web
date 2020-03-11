import Vue from 'vue'

import Cookies from 'js-cookie'

import 'normalize.css/normalize.css' // a modern alternative to CSS resets

import Element from 'element-ui'
import './styles/element-variables.scss'

import '@/styles/index.scss' // global css

import App from './App'
import store from './store'
import router from './router'

import './icons' // icon
import './permission' // permission control
import './utils/error-log' // error log
import request from '@/utils/request'
import * as filters from './filters' // global filters
import i18n from './lang' // internationalization
import permission from '@/directive/permission'

Vue.use(permission)
Vue.use(Element, {
  i18n: (key, value) => i18n.t(key, value),
  size: Cookies.get('size') || 'medium' // set element-ui default size
})

Vue.prototype.$post = request.post
Vue.prototype.$put = request.put
Vue.prototype.$patch = request.patch
Vue.prototype.$get = request.get
Vue.prototype.$delete = request.delete
Vue.prototype.$download = request.download
Vue.prototype.$upload = request.upload
Vue.prototype.$login = request.login


// register global utility filters
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})

Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  i18n,
  render: h => h(App)
})
