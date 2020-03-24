import request from '@/utils/request'

export function add(data) {
  return request.post('/system/dict', data)
}

export function del(id) {
  return request.delete('/system/dict', ids)
}

export function edit(data) {
  return request.put('/system/dict', data)
}

export default { add, edit, del }
