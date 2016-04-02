let maybeReconnect = function () {
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
    }
  }
}

_.extend(LoginLinks, {

  loginWithToken (accessToken, cb) {
    let loginRequest = {'login-links/accessToken': accessToken}

    Accounts.callLoginMethod({
      methodArguments: [loginRequest],
      userCallback: cb
    })
  },

  connectionLogin (token, cb) {
    Accounts._setLoggingIn(true)
    
    Meteor.call('login-links/connectionLogin', token, function (e, data) {
      Accounts._setLoggingIn(false)
      if (!e) {
        Meteor.connection.setUserId(data.userId)

        existingHook = Meteor.connection.onReconnect
        Meteor.connection.onReconnect = function(){
          if (existingHook)
            existingHook()

          l('onReconnect', Meteor.userId())
          // cleanup new connection
          Meteor.connection.setUserId(null)

          maybeReconnect()
        }

        data.hashedToken = 'unused' // prevent constructor error
        let accessToken = new LoginLinks.AccessToken(data)

        localStorage.setItem('login-links/connectionToken', token)
        localStorage.setItem('login-links/tokenExpiration', new Date(accessToken.expiresAt))
      }

      if (cb)
        cb(e, data)
    })
  }

})

maybeReconnect()

