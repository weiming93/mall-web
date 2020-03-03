import storage from '@/utils/localstorage'

export function getToken() {
  return storage.get('ACCESS_TOKEN', '')
}

export function getRefreshToken() {
  return storage.get('REFRESH_TOKEN', '')
}

export function getExpireTime() {
  return storage.get('EXPIRE_TIME', 0)
}

export function getRouteTokenExpireTime() {
  return storage.get('ROUTE_TOKEN_EXPIRE_TIME', 0)
}

export function getRouteToken() {
  return storage.get('ROUTE_TOKEN', '')
}

export function removeRouteToken() {
  return storage.remove('ROUTE_TOKEN')
}
