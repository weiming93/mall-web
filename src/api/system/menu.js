import request from '@/utils/request'

export function getMenuTree() {
  return request.get('/system/menu/tree')
}

export function getRoutes() {
  return request.get('/system/menu/routes')
}

export function add(data) {
  return request.post('/system/menu', data)
}

export function del(ids) {
  return request.delete('/system/menu', ids)
}

export function edit(data) {
  return request.put('/system/menu', data)
}

export default { add, edit, del, getMenuTree, getRoutes }
