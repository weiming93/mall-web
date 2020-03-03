const getters = {
  visitedViews: state => state.tagsView.visitedViews,
  cachedViews: state => state.tagsView.cachedViews,
  accessToken: state => state.user.accessToken,
  refreshToken: state => state.user.refreshToken,
  expireTime: state => state.user.expireTime,
  user: state => state.user.user,
  roles: state => state.user.roles,
  permissions: state => state.user.permissions,
  permission_routes: state => state.permission.routes,
  errorLogs: state => state.errorLog.logs,
  sidebar: state => state.app.sidebar,
  size: state => state.app.size,
  device: state => state.app.device,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  introduction: state => state.user.introduction

}
export default getters
