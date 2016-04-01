_.extend(LoginLinks, {

  loginWithToken (accessToken, cb) {
    var loginRequest = {'login-links/accessToken': accessToken}

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

        // cleanup new connection
        existingHook = Meteor.connection.onReconnect
        Meteor.connection.onReconnect = function(){
          if (existingHook)
            existingHook()

          l('onReconnect', Meteor.userId())
          Meteor.connection.setUserId(null)
        }
      }
      cb(e, data)
    })
  },

  setTypes () {} // server-only

})

