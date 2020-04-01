import request from '@/utils/request'

export function add(data) {
  return request.post('/system/user', data)
}

export function del(ids) {
  return request.delete('/system/user', ids)
}

export function edit(data) {
  return request.put('/system/user', data)
}

export function updatePass(data) {
  return request.patch('/system/user/pass', data)
}

export function updateProfile(data) {
  return request.patch('/system/user/profile', data)
}

export function getById(data) {
  return request.get('/system/user/' + data)
}
export default { add, edit, del, updatePass, updateProfile, getById }

