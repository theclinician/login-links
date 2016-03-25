Meteor.methods({

  'login-links/connectionLogin': function (token) {
    var userId

    user = LoginLinks._getUserByToken(token)
    l('connectionLogin user:', user._id)

    if (Meteor.userId() === user._id)
      throw new Meteor.Error('login-links/already-fully-logged-in')

    this.setUserId(user._id)

    let data = AccessToken.getCustomFields(token)

    for (hook in LoginLinks._connectionHooks) {
      value = hook(token, user)
      if (typeof value === 'object')
        _.extend(data, value)
    }

    data.userId = user._id

    return data
  }

})
