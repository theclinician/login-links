_.extend(LoginLinks, {

  loginWithToken (accessToken, cb) {
    var loginRequest = {'login-links/accessToken': accessToken}

    Accounts.callLoginMethod({
      methodArguments: [loginRequest],
      userCallback: cb
    })
  },

  connectionLogin (token, cb) {
    Meteor.call('login-links/connectionLogin', token, function (e, data) {
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

