Meteor.methods({

  'login-links/connectionLogin': function (token, additionalAuth) {
    let {user, savedToken} = LoginLinks._lookupToken(token)
    l('connectionLogin user:', user._id)

    if (Meteor.userId() === user._id)
      throw new Meteor.Error('login-links/already-fully-logged-in')

    let data = _.omit(savedToken, 'hashedToken')
    for (let hook of LoginLinks._connectionHooks) {
      value = hook(savedToken, user, additionalAuth)
      if (typeof value === 'object')
        _.extend(data, value)
    }

    data.userId = user._id

    this.setUserId(user._id)

    return data
  }

})
