import request from '@/utils/request'

export function add(data) {
  return request.post('/goods/attribute', data)
}

export function del(ids) {
  return request.delete('/goods/attribute', ids)
}

export function edit(data) {
  return request.put('/goods/attribute', data)
}

export default { add, edit, del }

