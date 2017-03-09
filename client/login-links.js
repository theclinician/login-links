const clearLocalStorage = () => {
  localStorage.removeItem('login-links/connectionToken')
  localStorage.removeItem('login-links/tokenExpiration')
}

let maybeRelogin = function () {
  let tokenExpiration = localStorage.getItem('login-links/tokenExpiration')
  if (tokenExpiration) {
    tokenExpiration = new Date(tokenExpiration)
    let tokenIsCurrent = tokenExpiration > new Date()
    if (tokenIsCurrent) {
      let token = localStorage.getItem('login-links/connectionToken')
      if (LoginLinks.connectionLoginReconnect)
        LoginLinks.connectionLoginReconnect(token)
      else
        LoginLinks.connectionLogin(token)
    } else {
      clearLocalStorage()
    }
  }
}

let existingHook

_.extend(LoginLinks, {

  /**
   * @callback loginCB
   * @param {object} error
   */

  /**
   * Attempt a full token login
   * @param {string} token - generated by generateAccessToken
   * @param {loginCB} cb
   */
  loginWithToken (accessToken, cb) {

    const additionalAuth = LoginLinks._additionalAuthAccessor()

    let loginRequest = {'login-links/accessToken': accessToken, 'login-links/additionalAuth' : additionalAuth}
    Accounts.callLoginMethod({
      methodArguments: [loginRequest],
      userCallback: cb
    })
  },

  /**
   * @callback connectionCB
   * @param {object} error
   * @param {object} data - has a `userId` field as well as any custom fields on the `token` stored in the database or fields returned from onConnectionLogin
   */

  /**
   * Attempt a temporary, connection-based login
   * @param {string} token - generated by generateAccessToken
   * @param {connectionCB} cb
   */
  connectionLogin (token, cb) {
    Accounts._setLoggingIn(true)
    const additionalAuth = LoginLinks._additionalAuthAccessor()

    Meteor.call('login-links/connectionLogin', token, additionalAuth, function (e, data) {
      Accounts._setLoggingIn(false)
      if (!e) {
        Meteor.connection.setUserId(data.userId)

        data.hashedToken = 'unused' // prevent constructor error
        let accessToken = new LoginLinks.AccessToken(data)

        localStorage.setItem('login-links/connectionToken', token)
        localStorage.setItem('login-links/tokenExpiration', new Date(accessToken.expiresAt))
      }

      if (cb)
        cb(e, data)
    })
  },


  // -- private functions --

  _cleanupNewConnection() {
    if (existingHook)
      existingHook()

    // callLoginMethod overwrites Meteor.connection.onReconnect,
    // but let's be defensive
    let wasConnectionLoggedIn = Meteor.userId() &&
          ! localStorage.getItem('Meteor.loginToken')

    if (wasConnectionLoggedIn) {
      Meteor.connection.setUserId(null)
    }

    maybeRelogin()
  },

  _setupHook() {
    existingHook = Meteor.connection.onReconnect
    Meteor.connection.onReconnect = LoginLinks._cleanupNewConnection
  }

})

if (! Meteor.userId())
  maybeRelogin()

Meteor.startup(LoginLinks._setupHook)

Accounts.onLogout(() => {
  clearLocalStorage()    
})
