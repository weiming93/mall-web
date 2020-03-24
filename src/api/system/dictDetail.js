import request from '@/utils/request'

export function getDictDetailByDictName(dictName) {
  const params = {
    dictName,
    page: 0,
    size: 9999
  }
  return request.get('/system/dictDetail', params)
}

export function add(data) {
  return request.post('/system/dictDetail', data)
}

export function del(id) {
  return request.delete('/system/dictDetail/' + id)
}

export function edit(data) {
  return request.put('/system/dictDetail', data)
}

export default { add, edit, del, getDictDetailByDictName }
