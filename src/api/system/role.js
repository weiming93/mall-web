import request from '@/utils/request'

// 获取所有的Role
export function getAll() {
  return request.get('/system/role/all')
}

export function add(data) {
  return request.post('/system/role', data)
}

export function get(ids) {
  return request.get('/system/role/' + ids)
}

export function getLevel() {
  return request.get('/system/role/level')
}

export function del(ids) {
  return request.delete('/system/role', ids)
}

export function edit(data) {
  return request.put('/system/role', data)
}

export function editMenu(data) {
  return request.put('/system/role/menu', data)
}

export default { add, edit, del, get, editMenu, getLevel, getAll }
