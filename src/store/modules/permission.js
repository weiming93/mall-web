import { constantRoutes } from '@/router'
import Layout from '@/layout'
import { getRoutes } from '@/api/system/menu'

export const filterAsyncRouter = (routers) => { // 遍历后台传来的路由字符串，转换为组件对象
  const accessedRouters = routers.filter(router => {
    if (router.component) {
      if (router.component === 'Layout') { // Layout组件特殊处理
        router.component = Layout
      } else {
        const component = router.component
        router.component = (resolve) => require(['@/views/' + component], resolve)
      }
    }
    if (router.children && router.children.length) {
      router.children = filterAsyncRouter(router.children)
    }
    return true
  })
  return accessedRouters
}

const state = {
  routes: constantRoutes,
  addRouters: []
}
const mutations = {
  SET_ROUTERS: (state, routers) => {
    state.addRouters = routers
    state.routes = constantRoutes.concat(routers)
  }
}
const actions = {
  generateRoutes({ commit }) {
    return new Promise((resolve, reject) => {
      getRoutes().then(res => {
        const asyncRouter = filterAsyncRouter(res)
        commit('SET_ROUTERS', asyncRouter)
        resolve(asyncRouter)
      }).catch(error => {
        reject(error)
      })
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
