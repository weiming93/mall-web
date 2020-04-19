import request from '@/utils/request'

export function getProvinceAndCityAndArea(data) {
  return request.get('/setting/area/provinceAndCityAndArea', data)
}

export function getProvinceAndCity(data) {
  return request.get('/setting/area/provinceAndCity', data)
}

export function getProvince(data) {
  return request.get('/setting/area/province', data)
}
