Meteor.methods({

  'login-links/connectionLogin': function (token) {
    if(LoginLinks._config.disableConnectionLogin === true){
      throw new Meteor.Error('login-links/connection-login-disabled')

    let {user, savedToken} = LoginLinks._lookupToken(token)
    l('connectionLogin user:', user._id)

    if (Meteor.userId() === user._id)
      throw new Meteor.Error('login-links/already-fully-logged-in')

    this.setUserId(user._id)

    let data = _.omit(savedToken, 'hashedToken')

    for (let hook of LoginLinks._connectionHooks) {
      value = hook(savedToken, user)
      if (typeof value === 'object')
        _.extend(data, value)
    }

    data.userId = user._id

    return data
  }

})
