import request from '@/utils/request'

export function add(data) {
  return request.post('/goods/parameter', data)
}

export function del(ids) {
  return request.delete('/goods/parameter', ids)
}

export function edit(data) {
  return request.put('/goods/parameter', data)
}

export default { add, edit, del }

