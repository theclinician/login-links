_.extend(LoginLinks, {

  loginWithToken (accessToken, cb) {
    var loginRequest = {'login-links/accessToken': accessToken}

    Accounts.callLoginMethod({
      methodArguments: [loginRequest],
      userCallback: cb
    })
  },

  connectionLogin (token, cb) {
    Meteor.call('login-links/connectionLogin', token, function (e, userId) {
      if (!e) {
        Meteor.connection.setUserId(userId)

        // cleanup new connection
        existingHook = Meteor.connection.onReconnect
        Meteor.connection.onReconnect = function(){
          if (existingHook)
            existingHook()

          l('onReconnect', Meteor.userId())
          Meteor.connection.setUserId(null)
        }
      }
      cb(e, userId)
    })
  },

  setTypes () {} // server-only

})

