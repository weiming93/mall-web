import request from '@/utils/request'

export function add(data) {
  return request.post('/goods/category', data)
}

export function del(ids) {
  return request.delete('/goods/category', ids)
}

export function edit(data) {
  return request.put('/goods/category', data)
}

export function getFirstLevel() {
  return request.get('/goods/category/firstLevel')
}

export default { add, edit, del,getFirstLevel }

