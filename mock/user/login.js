let userInfo = {
  userName: 'mapbar_front',
  userCode: 'SUPER_ADMIN',
  userId: 123456,
  permissions: []
}
export default {
  'get|/system/mgr/login': option => {
    return userInfo
  }
}
