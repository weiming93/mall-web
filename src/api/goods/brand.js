import request from '@/utils/request'

export function add(data) {
  return request.post('/goods/brand', data)
}

export function del(ids) {
  return request.delete('/goods/brand', ids)
}

export function edit(data) {
  return request.put('/goods/brand', data)
}

export default { add, edit, del }

