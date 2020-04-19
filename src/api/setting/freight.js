import request from '@/utils/request'

export function add(data) {
  return request.post('/setting/freight', data)
}

export function del(ids) {
  return request.delete('/setting/freight', ids)
}

export function edit(data) {
  return request.put('/setting/freight', data)
}

export default { add, edit, del }

