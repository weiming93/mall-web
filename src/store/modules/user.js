import storage from '@/utils/localstorage'
import request from '@/utils/request'

const state = {
  accessToken: storage.get('ACCESS_TOKEN'),
  refreshToken: storage.get('REFRESH_TOKEN'),
  expireTime: storage.get('EXPIRE_TIME', 0),
  user: {},
  roles: [],
  permissions: [],
  avatar: ''
}
const mutations = {
  SET_ACCESS_TOKEN(state, val) {
    storage.save('ACCESS_TOKEN', val)
    state.accessToken = val
  },
  SET_REFRESH_TOKEN(state, val) {
    storage.save('REFRESH_TOKEN', val)
    state.refreshToken = val
  },
  SET_EXPIRE_TIME(state, val) {
    storage.save('EXPIRE_TIME', val)
    state.expireTime = val
  },
  SET_USER(state, val) {
    state.user = val
  },
  SET_PERMISSIONS(state, val) {
    state.permissions = val
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  }
}
const actions = {
  // 获取用户信息
  getInfo({ commit }) {
    return new Promise((resolve, reject) => {
      request.get('/auth/user')
        .then(res => {
          commit('SET_USER', res.principal)
          commit('SET_ROLES', res.principal.roles)
          commit('SET_AVATAR', res.principal.avatar)
          commit('SET_PERMISSIONS', res.authorities.map(res => res.authority))
          resolve(res)
        }).catch(error => {
          reject(error)
        })
    })
  },
  // 报错token信息
  saveLoginData({ commit }, data) {
    commit('SET_ACCESS_TOKEN', data.access_token)
    commit('SET_REFRESH_TOKEN', data.refresh_token)
    const current = new Date()
    const expireTime = current.setTime(current.getTime() + 1000 * data.expires_in)
    commit('SET_EXPIRE_TIME', expireTime)
  },

  // 登出
  logOut({ commit }) {
    return new Promise((resolve, reject) => {
      request.delete('/auth/signout').then(res => {
        removeLoginInfo(commit)
        resolve(res)
      }).catch(error => {
        removeLoginInfo(commit)
        reject(error)
      })
    })
  },
  clean({ commit }) {
    removeLoginInfo(commit)
  }
}
// 移除登录信息
const removeLoginInfo = (commit) => {
  storage.clear()
  commit('SET_ACCESS_TOKEN', '')
  commit('SET_REFRESH_TOKEN', '')
  commit('SET_USER', {})
  commit('SET_PERMISSIONS', [])
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
