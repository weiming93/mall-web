import request from '@/utils/request'

export function add(data) {
  return request.post('/goods/type', data)
}

export function del(ids) {
  return request.delete('/goods/type', ids)
}

export function edit(data) {
  return request.put('/goods/type', data)
}

export function findAll() {
  return request.get('/goods/type/all')
}

export function getCascaderAttribute() {
  return request.get('/goods/type/cascaderAttribute')
}

export default { add, edit, del,findAll, getCascaderAttribute }

