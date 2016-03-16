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
      if (!e)
        Meteor.connection.setUserId(userId)

      cb(e, userId)
    })
  }

})

