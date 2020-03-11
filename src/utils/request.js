import axios from 'axios'
import {MessageBox, Message} from 'element-ui'
import {authorizationValue} from '@/settings'
import store from '@/store'
import {getToken, getRefreshToken, getExpireTime} from '@/utils/auth'
import router from '@/router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// 请求超时时间，10s
const requestTimeOut = 10 * 1000
const success = 200
// 更换令牌的时间区间
const checkRegion = 5 * 60 * 1000
// 提示信息显示时长
const messageDuration = 5 * 1000

// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: requestTimeOut // request timeout,
})

// request interceptor
service.interceptors.request.use(
  config => {
    let _config = config
    try {
      const expireTime = getExpireTime()
      if (expireTime) {
        const left = expireTime - new Date().getTime()
        const refreshToken = getRefreshToken()
        if (left < checkRegion && refreshToken) {
          _config = queryRefreshToken(_config, refreshToken)
        } else {
          if (getToken()) {
            _config.headers['Authorization'] = 'bearer ' + getToken()
          }
        }
      }
    } catch (e) {
      console.error(e)
    }
    return _config
  },
  error => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
   */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  response => {
    return response
  },
  error => {
    if (error.response) {
      let errorMessage
      if(error.response.data === null){
        errorMessage = '系统内部异常，请联系网站管理员'
      }else if(error.response.data.message){
        errorMessage = error.response.data.message
      }else{
        errorMessage = error.response.data
      }
      switch (error.response.status) {
        case 404:
          Message({
            message: '很抱歉，资源未找到',
            type: 'error',
            duration: messageDuration
          })
          break
        case 403:
          Message({
            message: '很抱歉，您暂无该操作权限',
            type: 'error',
            duration: messageDuration
          })
          break
        case 401:
          Message({
            message: '很抱歉，认证已失效，请重新登录',
            type: 'error',
            duration: messageDuration
          })
          break
        default:
          if (errorMessage === 'refresh token无效') {
            MessageBox.alert('登录已过期，请重新登录', '温馨提示', {
              confirmButtonText: '确定',
              showClose: false,
              callback: action => {
                router.push('/login')
              }
            })
          } else {
            Message({
              message: errorMessage,
              type: 'error',
              duration: messageDuration
            })
          }
          break
      }
    }
    return Promise.reject(error)
  }
)

const request = {
  refresh(url, params) {
    params['grant_type'] = 'refresh_token'
    return service.post(url, params, {
      headers: {
        'Authorization': authorizationValue
      }
    })
  },
  login(url, params) {
    params['grant_type'] = 'password'
    return service.post(url, {}, {
      params: params,
      headers: {
        'Authorization': authorizationValue
      }
    })
  },
  post(url, params) {
    return service.post(url, params)
  },
  put(url, params) {
    return service.put(url, params)
  },
  patch(url, params) {
    return service.patch(url, params)
  },
  get(url, params) {
    const _params = Object.is(params, undefined) ? '' : params
    return service.get(url, {
      params: _params,
      headers: {
        'Authorization': store.getters.accessToken
      }
    })
  },
  delete(url, params) {
    const _params = Object.is(params, undefined) ? '' : params
    return service.delete(url, {
      params: _params
    })
  },
  download(url, params, filename) {
    NProgress.start()
    return service.post(url, params, {
      responseType: 'blob'
    }).then((r) => {
      const content = r.data
      const blob = new Blob([content])
      if ('download' in document.createElement('a')) {
        const elink = document.createElement('a')
        elink.download = filename
        elink.style.display = 'none'
        elink.href = URL.createObjectURL(blob)
        document.body.appendChild(elink)
        elink.click()
        URL.revokeObjectURL(elink.href)
        document.body.removeChild(elink)
      } else {
        navigator.msSaveBlob(blob, filename)
      }
      NProgress.done()
    }).catch((r) => {
      console.error(r)
      NProgress.done()
      Message({
        message: '下载失败',
        type: 'error',
        duration: messageDuration
      })
    })
  },
  upload(url, params) {
    return service.post(url, params, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }
}

async function queryRefreshToken(config, refreshToken) {
  const result = await request.refresh('auth/oauth/token', {
    refresh_token: refreshToken
  })
  if (result.status === success) {
    await store.dispatch('user/saveLoginData')
    config.headers['Authorization'] = 'bearer ' + getToken()
  }
  return config
}


export default request
