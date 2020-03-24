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

export default { add, edit, del }

