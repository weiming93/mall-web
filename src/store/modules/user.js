import storage from '@/utils/localstorage'
import request from '@/utils/request'

const state = {
  accessToken: storage.get('ACCESS_TOKEN'),
  refreshToken: storage.get('REFRESH_TOKEN'),
  expireTime: storage.get('EXPIRE_TIME', 0),
  user: storage.get('USER'),
  roles: [],
  permissions: storage.get('PERMISSIONS'),
  avatar:''
}
const mutations = {
  setAccessToken(state, val) {
    storage.save('ACCESS_TOKEN', val)
    state.accessToken = val
  },
  setRefreshToken(state, val) {
    storage.save('REFRESH_TOKEN', val)
    state.refreshToken = val
  },
  setExpireTime(state, val) {
    storage.save('EXPIRE_TIME', val)
    state.expireTime = val
  },
  setUser(state, val) {
    storage.save('USER', val)
    state.user = val
  },
  setPermissions(state, val) {
    storage.save('PERMISSIONS', val)
    state.permissions = val
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
}
const actions = {
  // 获取用户信息
  getInfo({commit}) {
    return new Promise((resolve, reject) => {
      request.get("auth/user")
        .then(res => {
          debugger
          commit('setUser', res.data.principal)
          commit('SET_ROLES',res.data.principal.roles)
          commit('SET_AVATAR',res.data.principal.avatar)
          commit('setPermissions', res.data.authorities)
          resolve(res)
        }).catch(error => {
        reject(error)
      })
    })
  },
  // 报错token信息
  saveLoginData({commit}, data) {
    commit('setAccessToken', data.access_token)
    commit('setRefreshToken', data.refresh_token)
    const current = new Date()
    const expireTime = current.setTime(current.getTime() + 1000 * data.expires_in)
    commit('setExpireTime', expireTime)
  },

// 登出
  logOut({commit}) {
    return new Promise((resolve, reject) => {
      request.get("auth/signout").then(res => {
        removeLoginInfo(commit)
        resolve(res)
      }).catch(error => {
        removeLoginInfo(commit)
        reject(error)
      })
    })
  },
  clean({commit}){
    removeLoginInfo(commit)
  }
}
//移除登录信息
const removeLoginInfo = (commit) => {
  storage.clear()
  commit('setAccessToken', '')
  commit('setRefreshToken', '')
  commit('setUser', {})
  commit('setPermissions', [])
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
